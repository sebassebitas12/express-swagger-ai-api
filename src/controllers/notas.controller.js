const notas = require('../services/notas.service');
const claude = require('../services/claude.service');
const dbService = require('../services/db.service');

async function listarNotas(req, res) {
  const filtro = req.query.buscar || undefined;
  const categoriaId = req.query.categoria_id || undefined;
  const usuarioId = req.query.usuario_id || undefined;
  const lista = await notas.listar(filtro, categoriaId, usuarioId);
  res.json(lista);
}

async function obtenerNota(req, res) {
  const nota = await notas.buscar(Number(req.params.id));
  res.json(nota);
}

async function crearNota(req, res) {
  const creada = await notas.crear(req.body);
  res.status(201).json(creada);
}

async function actualizarNota(req, res) {
  const actualizada = await notas.actualizar(Number(req.params.id), req.body);
  res.json(actualizada);
}

async function actualizarNotaParcial(req, res) {
  const actualizada = await notas.actualizar(Number(req.params.id), req.body);
  res.json(actualizada);
}

async function eliminarNota(req, res) {
  await notas.eliminar(Number(req.params.id));
  res.status(204).send();
}

async function resumirNota(req, res) {
  const nota = await notas.buscar(Number(req.params.id));
  const r = await claude.preguntar(
    nota.contenido,
    'Resume el texto en 3 viñetas breves, en español.'
  );
  await dbService.registrarHistorialIA({
    tipo: `resumen_nota_${nota.id}`,
    prompt: nota.contenido,
    respuesta: r.respuesta,
    input_tokens: r.uso?.input_tokens || 0,
    output_tokens: r.uso?.output_tokens || 0,
  });
  res.json({ notaId: nota.id, resumen: r.respuesta });
}

async function extraerPalabrasClave(req, res) {
  const nota = await notas.buscar(Number(req.params.id));
  const r = await claude.preguntar(
    nota.contenido,
    'Extrae las 5 palabras o conceptos clave más importantes del texto, separados por comas, en español.'
  );
  await dbService.registrarHistorialIA({
    tipo: `palabras_clave_nota_${nota.id}`,
    prompt: nota.contenido,
    respuesta: r.respuesta,
    input_tokens: r.uso?.input_tokens || 0,
    output_tokens: r.uso?.output_tokens || 0,
  });
  res.json({ notaId: nota.id, palabrasClave: r.respuesta, uso: r.uso });
}

async function traducirNota(req, res) {
  const nota = await notas.buscar(Number(req.params.id));
  const idioma = req.body?.idioma || 'inglés';
  const r = await claude.preguntar(
    `Título: ${nota.titulo}\nContenido: ${nota.contenido}`,
    `Traduce el siguiente texto al idioma ${idioma} manteniendo el sentido técnico.`
  );
  await dbService.registrarHistorialIA({
    tipo: `traducir_${idioma}_nota_${nota.id}`,
    prompt: nota.contenido,
    respuesta: r.respuesta,
    input_tokens: r.uso?.input_tokens || 0,
    output_tokens: r.uso?.output_tokens || 0,
  });
  res.json({ notaId: nota.id, idioma, traduccion: r.respuesta, uso: r.uso });
}

module.exports = {
  listarNotas,
  obtenerNota,
  crearNota,
  actualizarNota,
  actualizarNotaParcial,
  eliminarNota,
  resumirNota,
  extraerPalabrasClave,
  traducirNota,
};
