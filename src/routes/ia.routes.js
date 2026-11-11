const router = require('express').Router();
const { z } = require('zod');
const validar = require('../middlewares/validar');
const limitarIA = require('../middlewares/limitarIA');
const claude = require('../services/claude.service');

router.use(limitarIA);

const preguntaSchema = z.object({
  pregunta: z.string().min(3).max(2000),
});

const chatSchema = z.object({
  sesionId: z.string().min(1).max(100),
  mensaje: z.string().min(1).max(2000),
});

// Historial en memoria por sesión (Reto extra: Conversación)
const sesiones = new Map();

/**
 * @openapi
 * /api/ia/preguntar:
 *   post:
 *     summary: Envía una pregunta libre al modelo de IA
 *     tags: [IA]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Pregunta'
 *     responses:
 *       200:
 *         description: Respuesta del modelo y uso de tokens
 *       400:
 *         description: Datos inválidos
 *       429:
 *         description: Límite de peticiones excedido
 *       502:
 *         description: IA no disponible
 */
router.post('/preguntar', validar(preguntaSchema), async (req, res) => {
  const r = await claude.preguntar(req.body.pregunta);
  res.json(r);
});

/**
 * @openapi
 * /api/ia/chat:
 *   post:
 *     summary: Conversación de varios turnos recordando el historial por sesionId
 *     tags: [IA]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChatInput'
 *     responses:
 *       200:
 *         description: Respuesta del modelo e historial actualizado
 *       400:
 *         description: Datos inválidos
 *       502:
 *         description: IA no disponible
 */
router.post('/chat', validar(chatSchema), async (req, res) => {
  const { sesionId, mensaje } = req.body;
  const historial = sesiones.get(sesionId) || [];
  historial.push({ role: 'user', content: mensaje });

  // Mantener últimos 20 mensajes para cuidar tokens
  const recortado = historial.slice(-20);
  const r = await claude.chat({ messages: recortado });

  recortado.push({ role: 'assistant', content: r.respuesta });
  sesiones.set(sesionId, recortado);

  res.json({
    sesionId,
    respuesta: r.respuesta,
    turnos: recortado.length,
    uso: r.uso,
  });
});

/**
 * @openapi
 * /api/ia/stream:
 *   post:
 *     summary: Envía una pregunta y recibe la respuesta en streaming (SSE)
 *     tags: [IA]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Pregunta'
 *     responses:
 *       200:
 *         description: Flujo de eventos text/event-stream
 *       400:
 *         description: Datos inválidos
 */
router.post('/stream', validar(preguntaSchema), async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    for await (const fragmento of claude.preguntarStream(req.body.pregunta)) {
      res.write(`data: ${JSON.stringify({ texto: fragmento })}\n\n`);
    }
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('Stream error:', err.message);
    res.write(`data: ${JSON.stringify({ error: 'IA_NO_DISPONIBLE' })}\n\n`);
    res.end();
  }
});

/**
 * @openapi
 * /api/ia/uso:
 *   get:
 *     summary: Consulta los tokens acumulados y el gasto estimado de la sesión
 *     tags: [IA]
 *     responses:
 *       200:
 *         description: Estadísticas de uso y costo estimado en USD
 */
router.get('/uso', (req, res) => {
  res.json(claude.obtenerEstadisticasUso());
});

module.exports = router;

