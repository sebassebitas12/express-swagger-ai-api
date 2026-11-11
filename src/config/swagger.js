const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');

module.exports = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Lab 5: API REST + MySQL + IA + Agentes',
      version: '1.0.0',
      description:
        'API REST conectada a MySQL (Usuarios, Categorías, Notas, Etiquetas e Historial IA) con Controladores, Servicios y DeepSeek/Claude IA',
    },
    servers: [{ url: 'http://localhost:3000' }],
    components: {
      schemas: {
        Nota: {
          type: 'object',
          required: ['titulo', 'contenido'],
          properties: {
            titulo: { type: 'string', example: 'Apuntes de REST y MySQL' },
            contenido: {
              type: 'string',
              example: 'REST usa verbos HTTP y se conecta a MySQL mediante controladores y servicios...',
            },
            prioridad: { type: 'string', enum: ['baja', 'media', 'alta'], example: 'alta' },
            estado: { type: 'string', enum: ['activa', 'archivada', 'completada'], example: 'activa' },
            usuario_id: { type: 'integer', example: 1 },
            categoria_id: { type: 'integer', example: 1 },
          },
        },
        NotaParcial: {
          type: 'object',
          properties: {
            titulo: { type: 'string', example: 'Título actualizado en MySQL' },
            contenido: { type: 'string', example: 'Contenido actualizado parcialmente' },
            prioridad: { type: 'string', enum: ['baja', 'media', 'alta'], example: 'alta' },
            estado: { type: 'string', enum: ['activa', 'archivada', 'completada'], example: 'completada' },
          },
        },
        Usuario: {
          type: 'object',
          required: ['nombre', 'email'],
          properties: {
            nombre: { type: 'string', example: 'Carlos Ramírez' },
            email: { type: 'string', example: 'carlos@universidad.edu' },
            rol: { type: 'string', enum: ['estudiante', 'docente', 'admin'], example: 'estudiante' },
          },
        },
        Categoria: {
          type: 'object',
          required: ['nombre'],
          properties: {
            nombre: { type: 'string', example: 'Bases de Datos MySQL' },
            descripcion: { type: 'string', example: 'Consultas SQL, relaciones y modelos' },
            color: { type: 'string', example: '#3b82f6' },
          },
        },
        Etiqueta: {
          type: 'object',
          required: ['nombre', 'nota_id'],
          properties: {
            nombre: { type: 'string', example: 'mysql' },
            nota_id: { type: 'integer', example: 1 },
          },
        },
        TraducirInput: {
          type: 'object',
          required: ['idioma'],
          properties: {
            idioma: { type: 'string', example: 'inglés' },
          },
        },
        Pregunta: {
          type: 'object',
          required: ['pregunta'],
          properties: {
            pregunta: { type: 'string', example: '¿Qué es REST?' },
          },
        },
        ChatInput: {
          type: 'object',
          required: ['sesionId', 'mensaje'],
          properties: {
            sesionId: { type: 'string', example: 'usuario-1' },
            mensaje: { type: 'string', example: 'Hola, explícame qué es Express en una línea' },
          },
        },
        AgenteInput: {
          type: 'object',
          required: ['mensaje'],
          properties: {
            mensaje: {
              type: 'string',
              example: 'Analiza mis notas actuales en MySQL y dime qué temas estoy estudiando',
            },
            tipo: { type: 'string', enum: ['soporte', 'analista'], example: 'analista' },
            incluirNotas: { type: 'boolean', example: true },
          },
        },
      },
    },
  },
  apis: [
    './src/routes/*.js',
    './src/app.js',
    path.join(__dirname, '../routes/*.js').replace(/\\/g, '/'),
    path.join(__dirname, '../app.js').replace(/\\/g, '/'),
  ],
});
