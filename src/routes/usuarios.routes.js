const router = require('express').Router();
const { z } = require('zod');
const validar = require('../middlewares/validar');
const usuariosCtrl = require('../controllers/usuarios.controller');

const usuarioSchema = z.object({
  nombre: z.string().min(2).max(100),
  email: z.string().email().max(120),
  rol: z.enum(['estudiante', 'docente', 'admin']).optional(),
});

const usuarioUpdateSchema = z.object({
  nombre: z.string().min(2).max(100).optional(),
  email: z.string().email().max(120).optional(),
  rol: z.enum(['estudiante', 'docente', 'admin']).optional(),
});

/**
 * @openapi
 * /api/usuarios:
 *   get:
 *     summary: Lista todos los usuarios registrados en MySQL
 *     tags: [Usuarios (MySQL)]
 *     responses:
 *       200: { description: Lista de usuarios }
 */
router.get('/', usuariosCtrl.listarUsuarios);

/**
 * @openapi
 * /api/usuarios/{id}:
 *   get:
 *     summary: Obtiene un usuario por su ID junto con sus notas creadas
 *     tags: [Usuarios (MySQL)]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Usuario encontrado con sus notas }
 *       404: { description: Usuario no encontrado }
 */
router.get('/:id', usuariosCtrl.obtenerUsuario);

/**
 * @openapi
 * /api/usuarios:
 *   post:
 *     summary: Crea un nuevo usuario en MySQL
 *     tags: [Usuarios (MySQL)]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Usuario'
 *     responses:
 *       201: { description: Usuario creado }
 *       400: { description: Datos inválidos o email duplicado }
 */
router.post('/', validar(usuarioSchema), usuariosCtrl.crearUsuario);

/**
 * @openapi
 * /api/usuarios/{id}:
 *   put:
 *     summary: Actualiza los datos de un usuario en MySQL
 *     tags: [Usuarios (MySQL)]
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
 *             $ref: '#/components/schemas/Usuario'
 *     responses:
 *       200: { description: Usuario actualizado }
 *       404: { description: Usuario no encontrado }
 */
router.put('/:id', validar(usuarioUpdateSchema), usuariosCtrl.actualizarUsuario);

/**
 * @openapi
 * /api/usuarios/{id}:
 *   delete:
 *     summary: Elimina un usuario de MySQL
 *     tags: [Usuarios (MySQL)]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Usuario eliminado }
 *       404: { description: Usuario no encontrado }
 */
router.delete('/:id', usuariosCtrl.eliminarUsuario);

module.exports = router;
