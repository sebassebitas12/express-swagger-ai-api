const etiquetas = require('../services/etiquetas.service');

async function listarEtiquetas(req, res) {
  const lista = await etiquetas.listar(req.query.nota_id);
  res.json(lista);
}

async function crearEtiqueta(req, res) {
  const creada = await etiquetas.crear(req.body);
  res.status(201).json(creada);
}

async function eliminarEtiqueta(req, res) {
  await etiquetas.eliminar(Number(req.params.id));
  res.status(204).send();
}

module.exports = {
  listarEtiquetas,
  crearEtiqueta,
  eliminarEtiqueta,
};
