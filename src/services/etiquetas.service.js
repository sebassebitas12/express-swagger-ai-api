const { getPool } = require('../config/database');
const { AppError } = require('../utils/errors');
const notasService = require('./notas.service');

async function listar(notaId) {
  const pool = await getPool();
  if (notaId) {
    const [rows] = await pool.query(
      'SELECT * FROM etiquetas WHERE nota_id = ? ORDER BY id ASC',
      [Number(notaId)]
    );
    return rows;
  }
  const [rows] = await pool.query(
    `SELECT e.*, n.titulo AS nota_titulo
     FROM etiquetas e
     INNER JOIN notas n ON e.nota_id = n.id
     ORDER BY e.id ASC`
  );
  return rows;
}

async function crear({ nombre, nota_id }) {
  await notasService.buscar(Number(nota_id)); // Verifica que la nota exista (404 si no)
  const pool = await getPool();
  const [result] = await pool.query(
    'INSERT INTO etiquetas (nombre, nota_id) VALUES (?, ?)',
    [nombre, Number(nota_id)]
  );
  const [rows] = await pool.query('SELECT * FROM etiquetas WHERE id = ?', [result.insertId]);
  return rows[0];
}

async function eliminar(id) {
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(404, 'Etiqueta no encontrada');
  }
  const pool = await getPool();
  const [rows] = await pool.query('SELECT * FROM etiquetas WHERE id = ?', [id]);
  if (rows.length === 0) throw new AppError(404, 'Etiqueta no encontrada');
  await pool.query('DELETE FROM etiquetas WHERE id = ?', [id]);
}

module.exports = { listar, crear, eliminar };
