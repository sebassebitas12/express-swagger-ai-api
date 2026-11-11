const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');

module.exports = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Lab 5: Notas + IA + Agentes',
      version: '1.0.0',
      description: 'API REST con Express, Controladores, Servicios, Prisma, Swagger y Agentes IA',
    },
    servers: [{ url: 'http://localhost:3000' }],
    components: {
      schemas: {
        Nota: {
          type: 'object',
          required: ['titulo', 'contenido'],
          properties: {
            titulo: { type: 'string', example: 'Apuntes de REST' },
            contenido: { type: 'string', example: 'REST es un estilo arquitectónico para sistemas distribuidos...' },
          },
        },
        NotaParcial: {
          type: 'object',
          properties: {
            titulo: { type: 'string', example: 'Título actualizado' },
            contenido: { type: 'string', example: 'Contenido actualizado parcialmente' },
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
            mensaje: { type: 'string', example: 'Analiza mis notas actuales y dime qué temas estoy estudiando' },
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
  ], // dónde leer los @openapi
});
