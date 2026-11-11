const router = require('express').Router();
const { z } = require('zod');
const validar = require('../middlewares/validar');
const limitarIA = require('../middlewares/limitarIA');
const { ejecutarAgente } = require('../controllers/agent.controller');

router.use(limitarIA);

const agenteSchema = z.object({
  mensaje: z.string().min(3).max(2000),
  tipo: z.enum(['soporte', 'analista']).optional(),
  incluirNotas: z.boolean().optional(),
});

/**
 * @openapi
 * /api/agent:
 *   post:
 *     summary: Endpoint directo del Agente IA (arquitectura agentes-node)
 *     tags: [Agentes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AgenteInput'
 *     responses:
 *       200: { description: Respuesta del agente }
 *       400: { description: Datos inválidos }
 *       502: { description: IA no disponible }
 */
router.post('/', validar(agenteSchema), ejecutarAgente);

module.exports = router;
