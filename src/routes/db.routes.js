const router = require('express').Router();
const dbCtrl = require('../controllers/db.controller');

/**
 * @openapi
 * /api/db/estado:
 *   get:
 *     summary: Verifica la conexión a MySQL y muestra el conteo de registros de las 5 tablas
 *     tags: [Base de Datos MySQL]
 *     responses:
 *       200: { description: Estado de conexión a MySQL y conteo de filas por tabla }
 *       500: { description: Error de conexión a MySQL }
 */
router.get('/estado', dbCtrl.verEstadoBaseDeDatos);

/**
 * @openapi
 * /api/db/historial-ia:
 *   get:
 *     summary: Consulta en MySQL todas las preguntas y resúmenes generados por la IA
 *     tags: [Base de Datos MySQL]
 *     responses:
 *       200: { description: Lista de registros de la tabla historial_ia en MySQL }
 */
router.get('/historial-ia', dbCtrl.verHistorialIA);

module.exports = router;
