const request = require('supertest');
const prisma = require('../src/db');

jest.mock('../src/services/claude.service', () => ({
  preguntar: jest.fn(),
  chat: jest.fn(),
  preguntarStream: jest.fn(),
  obtenerEstadisticasUso: jest.fn(() => ({
    llamadas: 1,
    input_tokens: 18,
    output_tokens: 45,
    costo_estimado_usd: 0.000054,
  })),
}));

const claude = require('../src/services/claude.service');
const app = require('../src/app');

beforeEach(async () => {
  jest.clearAllMocks();
  await prisma.nota.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Laboratorio 5 - API de Notas + IA', () => {
  test('1. Crear dos notas con POST /api/notas (201) y listarlas con GET /api/notas (200)', async () => {
    const r1 = await request(app)
      .post('/api/notas')
      .send({ titulo: 'Nota 1', contenido: 'Contenido de prueba para resumir con IA.' });
    expect(r1.status).toBe(201);
    expect(r1.body).toHaveProperty('id');

    const r2 = await request(app)
      .post('/api/notas')
      .send({ titulo: 'Nota 2', contenido: 'Segunda nota de prueba.' });
    expect(r2.status).toBe(201);

    const lista = await request(app).get('/api/notas');
    expect(lista.status).toBe(200);
    expect(lista.body).toHaveLength(2);
  });

  test('2. GET /api/notas/9999 devuelve 404 Nota no encontrada', async () => {
    const res = await request(app).get('/api/notas/9999');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Nota no encontrada' });
  });

  test('3. POST /api/notas con body vacío {} devuelve 400 con detalles de Zod', async () => {
    const res = await request(app).post('/api/notas').send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('errores');
  });

  test('4. DELETE /api/notas/:id devuelve 204 y después GET devuelve 404', async () => {
    const creada = await request(app)
      .post('/api/notas')
      .send({ titulo: 'Borrar', contenido: 'Texto' });
    const id = creada.body.id;

    const del = await request(app).delete(`/api/notas/${id}`);
    expect(del.status).toBe(204);

    const getAfter = await request(app).get(`/api/notas/${id}`);
    expect(getAfter.status).toBe(404);
  });

  test('5. POST /api/ia/preguntar devuelve 200 con respuesta y uso de tokens', async () => {
    claude.preguntar.mockResolvedValueOnce({
      respuesta: 'REST es un estilo de arquitectura.',
      uso: { input_tokens: 15, output_tokens: 40 },
    });

    const res = await request(app)
      .post('/api/ia/preguntar')
      .send({ pregunta: '¿Qué es REST?' });

    expect(res.status).toBe(200);
    expect(res.body.respuesta).toContain('REST');
    expect(res.body.uso).toEqual({ input_tokens: 15, output_tokens: 40 });
  });

  test('6. POST /api/ia/preguntar con pregunta de 1 letra devuelve 400 sin llamar a la IA', async () => {
    const res = await request(app)
      .post('/api/ia/preguntar')
      .send({ pregunta: 'a' });

    expect(res.status).toBe(400);
    expect(claude.preguntar).not.toHaveBeenCalled();
  });

  test('7. POST /api/notas/:id/resumen resume una nota existente (200)', async () => {
    const creada = await request(app)
      .post('/api/notas')
      .send({ titulo: 'Mi nota', contenido: 'Texto largo de la nota...' });

    claude.preguntar.mockResolvedValueOnce({
      respuesta: '• Punto 1\n• Punto 2\n• Punto 3',
      uso: { input_tokens: 25, output_tokens: 30 },
    });

    const res = await request(app).post(`/api/notas/${creada.body.id}/resumen`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      notaId: creada.body.id,
      resumen: '• Punto 1\n• Punto 2\n• Punto 3',
    });
  });

  test('8. POST /api/notas/9999/resumen devuelve 404 sin llamar a la IA', async () => {
    const res = await request(app).post('/api/notas/9999/resumen');
    expect(res.status).toBe(404);
    expect(claude.preguntar).not.toHaveBeenCalled();
  });

  test('9. Error 401 de la API de IA responde 502 IA_NO_DISPONIBLE sin filtrar detalles', async () => {
    const apiErr = new Error('401 Incorrect API key provided');
    apiErr.status = 401;
    apiErr.isLLMError = true;
    claude.preguntar.mockRejectedValueOnce(apiErr);

    const res = await request(app)
      .post('/api/ia/preguntar')
      .send({ pregunta: '¿Qué es Express?' });

    expect(res.status).toBe(502);
    expect(res.body).toEqual({ error: 'IA_NO_DISPONIBLE' });
  });
});

