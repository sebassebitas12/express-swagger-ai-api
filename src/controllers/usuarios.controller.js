const usuarios = require('../services/usuarios.service');

async function listarUsuarios(req, res) {
  const lista = await usuarios.listar();
  res.json(lista);
}

async function obtenerUsuario(req, res) {
  const u = await usuarios.buscar(Number(req.params.id));
  res.json(u);
}

async function crearUsuario(req, res) {
  const creado = await usuarios.crear(req.body);
  res.status(201).json(creado);
}

async function actualizarUsuario(req, res) {
  const actualizado = await usuarios.actualizar(Number(req.params.id), req.body);
  res.json(actualizado);
}

async function eliminarUsuario(req, res) {
  await usuarios.eliminar(Number(req.params.id));
  res.status(204).send();
}

module.exports = {
  listarUsuarios,
  obtenerUsuario,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
};
