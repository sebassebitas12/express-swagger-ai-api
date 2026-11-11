const claude = require('../services/claude.service');
const { soporte, analistaNotas } = require('../services/agent.service');
const notasService = require('../services/notas.service');
const dbService = require('../services/db.service');

const sesiones = new Map();

async function preguntarIA(req, res) {
  const r = await claude.preguntar(req.body.pregunta, req.body.system);
  await dbService.registrarHistorialIA({
    tipo: 'preguntar',
    prompt: req.body.pregunta,
    respuesta: r.respuesta,
    input_tokens: r.uso?.input_tokens || 0,
    output_tokens: r.uso?.output_tokens || 0,
  });
  res.json(r);
}

async function chatIA(req, res) {
  const { sesionId, mensaje } = req.body;
  const historial = sesiones.get(sesionId) || [];
  historial.push({ role: 'user', content: mensaje });

  const recortado = historial.slice(-20);
  const r = await claude.chat({ messages: recortado });

  recortado.push({ role: 'assistant', content: r.respuesta });
  sesiones.set(sesionId, recortado);

  await dbService.registrarHistorialIA({
    tipo: `chat_${sesionId}`,
    prompt: mensaje,
    respuesta: r.respuesta,
    input_tokens: r.uso?.input_tokens || 0,
    output_tokens: r.uso?.output_tokens || 0,
  });

  res.json({
    sesionId,
    respuesta: r.respuesta,
    turnos: recortado.length,
    uso: r.uso,
  });
}

async function limpiarHistorialChat(req, res) {
  const { sesionId } = req.params;
  sesiones.delete(sesionId);
  res.status(204).send();
}

async function streamIA(req, res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    for await (const fragmento of claude.preguntarStream(req.body.pregunta)) {
      res.write(`data: ${JSON.stringify({ texto: fragmento })}\n\n`);
    }
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('Stream error:', err.message);
    res.write(`data: ${JSON.stringify({ error: 'IA_NO_DISPONIBLE' })}\n\n`);
    res.end();
  }
}

async function ejecutarAgente(req, res) {
  const { mensaje, tipo = 'soporte', incluirNotas = true } = req.body;
  let contexto = mensaje;

  if (incluirNotas) {
    const lista = await notasService.listar();
    const resumenNotas = lista
      .map(
        (n) =>
          `[ID ${n.id} | Categoría: ${n.categoria_nombre || 'Sin categoría'} | Autor: ${n.usuario_nombre || 'Anónimo'}] ${n.titulo}: ${n.contenido}`
      )
      .join('\n');
    contexto = `Notas actuales en la base de datos MySQL:\n${resumenNotas || '(Sin notas)'}\n\nConsulta del usuario: ${mensaje}`;
  }

  const agente = tipo === 'analista' ? analistaNotas : soporte;
  const r = await agente(contexto);

  await dbService.registrarHistorialIA({
    tipo: `agente_${tipo}`,
    prompt: mensaje,
    respuesta: r.respuesta,
    input_tokens: r.uso?.input_tokens || 0,
    output_tokens: r.uso?.output_tokens || 0,
  });

  res.json({
    agente: tipo,
    respuesta: r.respuesta,
    uso: r.uso,
  });
}

function obtenerUsoIA(req, res) {
  res.json(claude.obtenerEstadisticasUso());
}

module.exports = {
  preguntarIA,
  chatIA,
  limpiarHistorialChat,
  streamIA,
  ejecutarAgente,
  obtenerUsoIA,
};
