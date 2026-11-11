const router = require('express').Router();
const { z } = require('zod');
const validar = require('../middlewares/validar');
const categoriasCtrl = require('../controllers/categorias.controller');

const categoriaSchema = z.object({
  nombre: z.string().min(2).max(80),
  descripcion: z.string().max(255).optional(),
  color: z.string().max(20).optional(),
});

/**
 * @openapi
 * /api/categorias:
 *   get:
 *     summary: Lista todas las categorías de notas desde MySQL
 *     tags: [Categorías (MySQL)]
 *     responses:
 *       200: { description: Lista de categorías }
 */
router.get('/', categoriasCtrl.listarCategorias);

/**
 * @openapi
 * /api/categorias/{id}:
 *   get:
 *     summary: Obtiene una categoría por su ID junto con todas sus notas asociadas
 *     tags: [Categorías (MySQL)]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Categoría y sus notas }
 *       404: { description: Categoría no encontrada }
 */
router.get('/:id', categoriasCtrl.obtenerCategoria);

/**
 * @openapi
 * /api/categorias:
 *   post:
 *     summary: Crea una nueva categoría en MySQL
 *     tags: [Categorías (MySQL)]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Categoria'
 *     responses:
 *       201: { description: Categoría creada }
 *       400: { description: Datos inválidos }
 */
router.post('/', validar(categoriaSchema), categoriasCtrl.crearCategoria);

/**
 * @openapi
 * /api/categorias/{id}:
 *   put:
 *     summary: Actualiza una categoría existente en MySQL
 *     tags: [Categorías (MySQL)]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Categoria'
 *     responses:
 *       200: { description: Categoría actualizada }
 *       404: { description: Categoría no encontrada }
 */
router.put('/:id', validar(categoriaSchema), categoriasCtrl.actualizarCategoria);

/**
 * @openapi
 * /api/categorias/{id}:
 *   delete:
 *     summary: Elimina una categoría de MySQL
 *     tags: [Categorías (MySQL)]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Categoría eliminada }
 *       404: { description: Categoría no encontrada }
 */
router.delete('/:id', categoriasCtrl.eliminarCategoria);

module.exports = router;
