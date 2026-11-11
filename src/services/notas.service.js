const { getPool } = require('../config/database');
const { AppError } = require('../utils/errors');

async function listar(filtro, categoriaId, usuarioId) {
  const pool = await getPool();
  let sql = `
    SELECT n.*,
           u.nombre AS usuario_nombre,
           c.nombre AS categoria_nombre
    FROM notas n
    LEFT JOIN usuarios u ON n.usuario_id = u.id
    LEFT JOIN categorias c ON n.categoria_id = c.id
    WHERE 1=1
  `;
  const params = [];

  if (filtro) {
    sql += ' AND (n.titulo LIKE ? OR n.contenido LIKE ?)';
    params.push(`%${filtro}%`, `%${filtro}%`);
  }
  if (categoriaId) {
    sql += ' AND n.categoria_id = ?';
    params.push(Number(categoriaId));
  }
  if (usuarioId) {
    sql += ' AND n.usuario_id = ?';
    params.push(Number(usuarioId));
  }

  sql += ' ORDER BY n.id ASC';
  const [rows] = await pool.query(sql, params);
  return rows;
}

async function buscar(id) {
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(404, 'Nota no encontrada');
  }
  const pool = await getPool();
  const [rows] = await pool.query(
    `SELECT n.*,
            u.nombre AS usuario_nombre,
            c.nombre AS categoria_nombre
     FROM notas n
     LEFT JOIN usuarios u ON n.usuario_id = u.id
     LEFT JOIN categorias c ON n.categoria_id = c.id
     WHERE n.id = ?`,
    [id]
  );
  if (rows.length === 0) throw new AppError(404, 'Nota no encontrada');

  const [etiquetas] = await pool.query(
    'SELECT id, nombre FROM etiquetas WHERE nota_id = ? ORDER BY id ASC',
    [id]
  );
  return { ...rows[0], etiquetas };
}

async function crear({
  titulo,
  contenido,
  prioridad = 'media',
  estado = 'activa',
  usuario_id = null,
  categoria_id = null,
}) {
  const pool = await getPool();
  const [result] = await pool.query(
    `INSERT INTO notas (titulo, contenido, prioridad, estado, usuario_id, categoria_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [titulo, contenido, prioridad, estado, usuario_id, categoria_id]
  );
  return buscar(result.insertId);
}

async function actualizar(id, datos) {
  const actual = await buscar(id);
  const pool = await getPool();
  const titulo = datos.titulo ?? actual.titulo;
  const contenido = datos.contenido ?? actual.contenido;
  const prioridad = datos.prioridad ?? actual.prioridad;
  const estado = datos.estado ?? actual.estado;
  const usuario_id = datos.usuario_id !== undefined ? datos.usuario_id : actual.usuario_id;
  const categoria_id = datos.categoria_id !== undefined ? datos.categoria_id : actual.categoria_id;

  await pool.query(
    `UPDATE notas
     SET titulo = ?, contenido = ?, prioridad = ?, estado = ?, usuario_id = ?, categoria_id = ?
     WHERE id = ?`,
    [titulo, contenido, prioridad, estado, usuario_id, categoria_id, id]
  );
  return buscar(id);
}

async function eliminar(id) {
  await buscar(id); // lanza 404 si no existe
  const pool = await getPool();
  await pool.query('DELETE FROM notas WHERE id = ?', [id]);
}

module.exports = { listar, buscar, crear, actualizar, eliminar };
