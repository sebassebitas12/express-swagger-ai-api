const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');

module.exports = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Lab 5: Notas + IA',
      version: '1.0.0',
      description: 'API REST de Notas con Express, Prisma, Swagger y DeepSeek IA',
    },
    servers: [{ url: 'http://localhost:3000' }],
    components: {
      schemas: {
        Nota: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            titulo: { type: 'string', example: 'Apuntes de REST' },
            contenido: { type: 'string', example: 'REST usa verbos HTTP y códigos de estado...' },
            creada: { type: 'string', format: 'date-time' },
          },
        },
        NotaInput: {
          type: 'object',
          required: ['titulo', 'contenido'],
          properties: {
            titulo: { type: 'string', example: 'Apuntes de REST' },
            contenido: { type: 'string', example: 'REST es un estilo arquitectónico para sistemas distribuidos...' },
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
      },
    },
  },
  apis: [path.join(__dirname, '../routes/*.js').replace(/\\/g, '/')],
});

