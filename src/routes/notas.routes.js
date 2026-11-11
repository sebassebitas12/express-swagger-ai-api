const router = require('express').Router();
const { z } = require('zod');
const validar = require('../middlewares/validar');
const notas = require('../services/notas.service');
const claude = require('../services/claude.service');

const notaSchema = z.object({
  titulo: z.string().min(1).max(100),
  contenido: z.string().min(1).max(5000),
});

/**
 * @openapi
 * /api/notas:
 *   get:
 *     summary: Lista todas las notas
 *     tags: [Notas]
 *     responses:
 *       200:
 *         description: Lista de notas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Nota'
 */
router.get('/', async (req, res) => {
  const lista = await notas.listar();
  res.json(lista);
});

/**
 * @openapi
 * /api/notas/{id}:
 *   get:
 *     summary: Obtiene una nota por su ID
 *     tags: [Notas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Nota encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Nota'
 *       404:
 *         description: Nota no encontrada
 */
router.get('/:id', async (req, res) => {
  const nota = await notas.buscar(Number(req.params.id));
  res.json(nota);
});

/**
 * @openapi
 * /api/notas:
 *   post:
 *     summary: Crea una nueva nota
 *     tags: [Notas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NotaInput'
 *     responses:
 *       201:
 *         description: Nota creada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Nota'
 *       400:
 *         description: Datos inválidos (Zod)
 */
router.post('/', validar(notaSchema), async (req, res) => {
  const creada = await notas.crear(req.body);
  res.status(201).json(creada);
});

/**
 * @openapi
 * /api/notas/{id}:
 *   delete:
 *     summary: Elimina una nota por su ID
 *     tags: [Notas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Nota eliminada sin contenido
 *       404:
 *         description: Nota no encontrada
 */
router.delete('/:id', async (req, res) => {
  await notas.eliminar(Number(req.params.id));
  res.status(204).send();
});

/**
 * @openapi
 * /api/notas/{id}/resumen:
 *   post:
 *     summary: Resume el contenido de una nota en 3 viñetas usando IA
 *     tags: [IA]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Resumen generado por la IA
 *       404:
 *         description: Nota no encontrada
 *       502:
 *         description: IA no disponible
 */
router.post('/:id/resumen', async (req, res) => {
  const nota = await notas.buscar(Number(req.params.id)); // 404 si no existe, sin llamar a la IA
  const r = await claude.preguntar(
    nota.contenido,
    'Resume el texto en 3 viñetas breves, en español.'
  );
  res.json({ notaId: nota.id, resumen: r.respuesta });
});

module.exports = router;

