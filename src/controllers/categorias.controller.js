const categorias = require('../services/categorias.service');

async function listarCategorias(req, res) {
  const lista = await categorias.listar();
  res.json(lista);
}

async function obtenerCategoria(req, res) {
  const c = await categorias.buscar(Number(req.params.id));
  res.json(c);
}

async function crearCategoria(req, res) {
  const creada = await categorias.crear(req.body);
  res.status(201).json(creada);
}

async function actualizarCategoria(req, res) {
  const actualizada = await categorias.actualizar(Number(req.params.id), req.body);
  res.json(actualizada);
}

async function eliminarCategoria(req, res) {
  await categorias.eliminar(Number(req.params.id));
  res.status(204).send();
}

module.exports = {
  listarCategorias,
  obtenerCategoria,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
};
