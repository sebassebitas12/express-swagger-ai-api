const claude = require('../services/claude.service');
const { soporte, analistaNotas } = require('../services/agent.service');
const notasService = require('../services/notas.service');

const sesiones = new Map();

async function preguntarIA(req, res) {
  const r = await claude.preguntar(req.body.pregunta, req.body.system);
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
      .map((n) => `[ID ${n.id}] ${n.titulo}: ${n.contenido}`)
      .join('\n');
    contexto = `Notas actuales en el sistema:\n${resumenNotas || '(Sin notas)'}\n\nConsulta del usuario: ${mensaje}`;
  }

  const agente = tipo === 'analista' ? analistaNotas : soporte;
  const r = await agente(contexto);
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
