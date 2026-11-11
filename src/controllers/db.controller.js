const dbService = require('../services/db.service');

async function verEstadoBaseDeDatos(req, res) {
  try {
    const estado = await dbService.obtenerEstadoDB();
    res.json(estado);
  } catch (err) {
    res.status(500).json({
      motor: 'MySQL',
      conectado: false,
      error: 'Error de conexión a MySQL. Verifica DB_USER y DB_PASSWORD en tu archivo .env',
      detalle: err.message,
    });
  }
}

async function verHistorialIA(req, res) {
  const historial = await dbService.listarHistorialIA();
  res.json(historial);
}

module.exports = { verEstadoBaseDeDatos, verHistorialIA };
