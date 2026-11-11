const { getPool } = require('../config/database');
const { AppError } = require('../utils/errors');

async function listar() {
  const pool = await getPool();
  const [rows] = await pool.query('SELECT * FROM usuarios ORDER BY id ASC');
  return rows;
}

async function buscar(id) {
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(404, 'Usuario no encontrado');
  }
  const pool = await getPool();
  const [rows] = await pool.query('SELECT * FROM usuarios WHERE id = ?', [id]);
  if (rows.length === 0) throw new AppError(404, 'Usuario no encontrado');

  const [notas] = await pool.query('SELECT * FROM notas WHERE usuario_id = ? ORDER BY id ASC', [id]);
  return { ...rows[0], notas };
}

async function crear({ nombre, email, rol = 'estudiante' }) {
  const pool = await getPool();
  try {
    const [result] = await pool.query(
      'INSERT INTO usuarios (nombre, email, rol) VALUES (?, ?, ?)',
      [nombre, email, rol]
    );
    return buscar(result.insertId);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      throw new AppError(400, 'El email ya está registrado');
    }
    throw err;
  }
}

async function actualizar(id, datos) {
  const actual = await buscar(id);
  const pool = await getPool();
  const nombre = datos.nombre ?? actual.nombre;
  const email = datos.email ?? actual.email;
  const rol = datos.rol ?? actual.rol;

  await pool.query('UPDATE usuarios SET nombre = ?, email = ?, rol = ? WHERE id = ?', [
    nombre,
    email,
    rol,
    id,
  ]);
  return buscar(id);
}

async function eliminar(id) {
  await buscar(id);
  const pool = await getPool();
  await pool.query('DELETE FROM usuarios WHERE id = ?', [id]);
}

module.exports = { listar, buscar, crear, actualizar, eliminar };
