const router = require('express').Router();
const { z } = require('zod');
const validar = require('../middlewares/validar');
const etiquetasCtrl = require('../controllers/etiquetas.controller');

const etiquetaSchema = z.object({
  nombre: z.string().min(1).max(50),
  nota_id: z.number().int().positive(),
});

/**
 * @openapi
 * /api/etiquetas:
 *   get:
 *     summary: Lista todas las etiquetas en MySQL o filtra por nota_id
 *     tags: [Etiquetas (MySQL)]
 *     parameters:
 *       - in: query
 *         name: nota_id
 *         required: false
 *         description: Filtrar etiquetas de una nota específica
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Lista de etiquetas }
 */
router.get('/', etiquetasCtrl.listarEtiquetas);

/**
 * @openapi
 * /api/etiquetas:
 *   post:
 *     summary: Asigna una nueva etiqueta a una nota en MySQL
 *     tags: [Etiquetas (MySQL)]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Etiqueta'
 *     responses:
 *       201: { description: Etiqueta creada }
 *       400: { description: Datos inválidos }
 *       404: { description: Nota no encontrada }
 */
router.post('/', validar(etiquetaSchema), etiquetasCtrl.crearEtiqueta);

/**
 * @openapi
 * /api/etiquetas/{id}:
 *   delete:
 *     summary: Elimina una etiqueta de MySQL por su ID
 *     tags: [Etiquetas (MySQL)]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Etiqueta eliminada }
 *       404: { description: Etiqueta no encontrada }
 */
router.delete('/:id', etiquetasCtrl.eliminarEtiqueta);

module.exports = router;
