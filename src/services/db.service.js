const { dbConfig, getPool } = require('../config/database');

async function obtenerEstadoDB() {
  const pool = await getPool();
  const [[u]] = await pool.query('SELECT COUNT(*) AS total FROM usuarios');
  const [[c]] = await pool.query('SELECT COUNT(*) AS total FROM categorias');
  const [[n]] = await pool.query('SELECT COUNT(*) AS total FROM notas');
  const [[e]] = await pool.query('SELECT COUNT(*) AS total FROM etiquetas');
  const [[h]] = await pool.query('SELECT COUNT(*) AS total FROM historial_ia');

  return {
    motor: 'MySQL',
    conectado: true,
    host: dbConfig.host,
    puerto: dbConfig.port,
    baseDeDatos: dbConfig.database,
    tablas: {
      usuarios: u.total,
      categorias: c.total,
      notas: n.total,
      etiquetas: e.total,
      historial_ia: h.total,
    },
  };
}

async function registrarHistorialIA({ tipo, prompt, respuesta, input_tokens = 0, output_tokens = 0 }) {
  try {
    const pool = await getPool();
    await pool.query(
      `INSERT INTO historial_ia (tipo, prompt, respuesta, input_tokens, output_tokens)
       VALUES (?, ?, ?, ?, ?)`,
      [tipo, prompt, respuesta, input_tokens, output_tokens]
    );
  } catch (err) {
    console.error('No se pudo guardar en historial_ia MySQL:', err.message);
  }
}

async function listarHistorialIA() {
  const pool = await getPool();
  const [rows] = await pool.query('SELECT * FROM historial_ia ORDER BY id DESC LIMIT 50');
  return rows;
}

module.exports = { obtenerEstadoDB, registrarHistorialIA, listarHistorialIA };
