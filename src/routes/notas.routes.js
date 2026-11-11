const router = require('express').Router();
const { z } = require('zod');
const validar = require('../middlewares/validar');
const notasCtrl = require('../controllers/notas.controller');

const notaSchema = z.object({
  titulo: z.string().min(1).max(100),
  contenido: z.string().min(1).max(5000),
  prioridad: z.enum(['baja', 'media', 'alta']).optional(),
  estado: z.enum(['activa', 'archivada', 'completada']).optional(),
  usuario_id: z.number().int().positive().nullable().optional(),
  categoria_id: z.number().int().positive().nullable().optional(),
});

const notaPatchSchema = z
  .object({
    titulo: z.string().min(1).max(100).optional(),
    contenido: z.string().min(1).max(5000).optional(),
    prioridad: z.enum(['baja', 'media', 'alta']).optional(),
    estado: z.enum(['activa', 'archivada', 'completada']).optional(),
    usuario_id: z.number().int().positive().nullable().optional(),
    categoria_id: z.number().int().positive().nullable().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, {
    message: 'Debe proporcionar al menos un campo para actualizar',
  });

const traducirSchema = z.object({
  idioma: z.string().min(2).max(40).default('inglés'),
});

/**
 * @openapi
 * /api/notas:
 *   get:
 *     summary: Lista todas las notas desde MySQL o filtra por búsqueda, categoría o usuario
 *     tags: [Notas]
 *     parameters:
 *       - in: query
 *         name: buscar
 *         required: false
 *         description: Texto opcional para filtrar por título o contenido
 *         schema: { type: string }
 *       - in: query
 *         name: categoria_id
 *         required: false
 *         description: ID de la categoría para filtrar notas
 *         schema: { type: integer }
 *       - in: query
 *         name: usuario_id
 *         required: false
 *         description: ID del usuario autor para filtrar notas
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Lista de notas obtenida desde MySQL }
 */
router.get('/', notasCtrl.listarNotas);

/**
 * @openapi
 * /api/notas/{id}:
 *   get:
 *     summary: Obtiene una nota de MySQL con su autor, categoría y etiquetas
 *     tags: [Notas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Nota encontrada }
 *       404: { description: Nota no encontrada }
 */
router.get('/:id', notasCtrl.obtenerNota);

/**
 * @openapi
 * /api/notas:
 *   post:
 *     summary: Crea una nota en MySQL (titulo, contenido, prioridad, usuario_id, categoria_id)
 *     tags: [Notas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Nota'
 *     responses:
 *       201: { description: Nota creada en MySQL }
 *       400: { description: Datos inválidos }
 */
router.post('/', validar(notaSchema), notasCtrl.crearNota);

/**
 * @openapi
 * /api/notas/{id}:
 *   put:
 *     summary: Actualiza completamente una nota en MySQL
 *     tags: [Notas]
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
 *             $ref: '#/components/schemas/Nota'
 *     responses:
 *       200: { description: Nota actualizada }
 *       400: { description: Datos inválidos }
 *       404: { description: Nota no encontrada }
 */
router.put('/:id', validar(notaSchema), notasCtrl.actualizarNota);

/**
 * @openapi
 * /api/notas/{id}:
 *   patch:
 *     summary: Actualiza parcialmente campos de una nota en MySQL
 *     tags: [Notas]
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
 *             $ref: '#/components/schemas/NotaParcial'
 *     responses:
 *       200: { description: Nota modificada parcialmente }
 *       400: { description: Datos inválidos }
 *       404: { description: Nota no encontrada }
 */
router.patch('/:id', validar(notaPatchSchema), notasCtrl.actualizarNotaParcial);

/**
 * @openapi
 * /api/notas/{id}:
 *   delete:
 *     summary: Elimina una nota de MySQL
 *     tags: [Notas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Nota eliminada }
 *       404: { description: Nota no encontrada }
 */
router.delete('/:id', notasCtrl.eliminarNota);

/**
 * @openapi
 * /api/notas/{id}/resumen:
 *   post:
 *     summary: Resume una nota en 3 viñetas con IA y guarda el resultado en MySQL
 *     tags: [IA]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Resumen de la nota }
 *       404: { description: Nota no encontrada }
 *       502: { description: Claude no disponible }
 */
router.post('/:id/resumen', notasCtrl.resumirNota);

/**
 * @openapi
 * /api/notas/{id}/palabras-clave:
 *   post:
 *     summary: Extrae las 5 palabras clave principales de una nota con IA
 *     tags: [IA]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Palabras clave extraídas }
 *       404: { description: Nota no encontrada }
 *       502: { description: IA no disponible }
 */
router.post('/:id/palabras-clave', notasCtrl.extraerPalabrasClave);

/**
 * @openapi
 * /api/notas/{id}/traducir:
 *   post:
 *     summary: Traduce el título y contenido de una nota a otro idioma con IA
 *     tags: [IA]
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
 *             $ref: '#/components/schemas/TraducirInput'
 *     responses:
 *       200: { description: Nota traducida correctamente }
 *       400: { description: Idioma inválido }
 *       404: { description: Nota no encontrada }
 *       502: { description: IA no disponible }
 */
router.post('/:id/traducir', validar(traducirSchema), notasCtrl.traducirNota);

module.exports = router;
