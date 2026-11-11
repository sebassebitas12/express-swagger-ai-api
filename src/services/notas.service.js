const prisma = require('../db');
const { AppError } = require('../utils/errors');

async function listar() {
  return prisma.nota.findMany({ orderBy: { id: 'asc' } });
}

async function buscar(id) {
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(404, 'Nota no encontrada');
  }
  const n = await prisma.nota.findUnique({ where: { id } });
  if (!n) throw new AppError(404, 'Nota no encontrada');
  return n;
}

async function crear({ titulo, contenido }) {
  return prisma.nota.create({
    data: { titulo, contenido },
  });
}

async function eliminar(id) {
  await buscar(id); // lanza 404 si no existe
  await prisma.nota.delete({ where: { id } });
}

module.exports = { listar, buscar, crear, eliminar };

