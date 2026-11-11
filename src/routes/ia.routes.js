const router = require('express').Router();
const { z } = require('zod');
const validar = require('../middlewares/validar');
const limitarIA = require('../middlewares/limitarIA');
const iaCtrl = require('../controllers/ia.controller');

router.use(limitarIA);

const preguntaSchema = z.object({
  pregunta: z.string().min(3).max(2000),
  system: z.string().min(3).max(500).optional(),
});

const chatSchema = z.object({
  sesionId: z.string().min(1).max(100),
  mensaje: z.string().min(1).max(2000),
});

const agenteSchema = z.object({
  mensaje: z.string().min(3).max(2000),
  tipo: z.enum(['soporte', 'analista']).optional(),
  incluirNotas: z.boolean().optional(),
});

/**
 * @openapi
 * /api/ia/preguntar:
 *   post:
 *     summary: Envía una pregunta a Claude / DeepSeek
 *     tags: [IA]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Pregunta'
 *     responses:
 *       200: { description: Respuesta del modelo }
 *       400: { description: Datos inválidos }
 *       429: { description: Demasiadas peticiones }
 *       502: { description: Claude no disponible }
 */
router.post('/preguntar', validar(preguntaSchema), iaCtrl.preguntarIA);

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
 *       200: { description: Respuesta del modelo con historial }
 *       400: { description: Datos inválidos }
 *       502: { description: IA no disponible }
 */
router.post('/chat', validar(chatSchema), iaCtrl.chatIA);

/**
 * @openapi
 * /api/ia/chat/{sesionId}:
 *   delete:
 *     summary: Borra el historial de conversación de una sesión
 *     tags: [IA]
 *     parameters:
 *       - in: path
 *         name: sesionId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: Historial de sesión eliminado }
 */
router.delete('/chat/:sesionId', iaCtrl.limpiarHistorialChat);

/**
 * @openapi
 * /api/ia/stream:
 *   post:
 *     summary: Envía una pregunta y recibe la respuesta en tiempo real (Streaming SSE)
 *     tags: [IA]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Pregunta'
 *     responses:
 *       200: { description: Flujo de eventos text/event-stream }
 *       400: { description: Datos inválidos }
 *       502: { description: IA no disponible }
 */
router.post('/stream', validar(preguntaSchema), iaCtrl.streamIA);

/**
 * @openapi
 * /api/ia/agente:
 *   post:
 *     summary: Ejecuta un Agente de IA (soporte o analista) con acceso a las notas guardadas
 *     tags: [Agentes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AgenteInput'
 *     responses:
 *       200: { description: Respuesta razonada del agente }
 *       400: { description: Datos inválidos }
 *       502: { description: IA no disponible }
 */
router.post('/agente', validar(agenteSchema), iaCtrl.ejecutarAgente);

/**
 * @openapi
 * /api/ia/uso:
 *   get:
 *     summary: Consulta los tokens acumulados y el gasto estimado en USD
 *     tags: [IA]
 *     responses:
 *       200: { description: Estadísticas de uso y costo }
 */
router.get('/uso', iaCtrl.obtenerUsoIA);

module.exports = router;
