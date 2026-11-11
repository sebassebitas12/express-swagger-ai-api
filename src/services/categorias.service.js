const { getPool } = require('../config/database');
const { AppError } = require('../utils/errors');

async function listar() {
  const pool = await getPool();
  const [rows] = await pool.query('SELECT * FROM categorias ORDER BY id ASC');
  return rows;
}

async function buscar(id) {
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(404, 'Categoría no encontrada');
  }
  const pool = await getPool();
  const [rows] = await pool.query('SELECT * FROM categorias WHERE id = ?', [id]);
  if (rows.length === 0) throw new AppError(404, 'Categoría no encontrada');

  const [notas] = await pool.query('SELECT * FROM notas WHERE categoria_id = ? ORDER BY id ASC', [id]);
  return { ...rows[0], notas };
}

async function crear({ nombre, descripcion = '', color = '#3b82f6' }) {
  const pool = await getPool();
  const [result] = await pool.query(
    'INSERT INTO categorias (nombre, descripcion, color) VALUES (?, ?, ?)',
    [nombre, descripcion, color]
  );
  return buscar(result.insertId);
}

async function actualizar(id, datos) {
  const actual = await buscar(id);
  const pool = await getPool();
  const nombre = datos.nombre ?? actual.nombre;
  const descripcion = datos.descripcion ?? actual.descripcion;
  const color = datos.color ?? actual.color;

  await pool.query(
    'UPDATE categorias SET nombre = ?, descripcion = ?, color = ? WHERE id = ?',
    [nombre, descripcion, color, id]
  );
  return buscar(id);
}

async function eliminar(id) {
  await buscar(id);
  const pool = await getPool();
  await pool.query('DELETE FROM categorias WHERE id = ?', [id]);
}

module.exports = { listar, buscar, crear, actualizar, eliminar };
