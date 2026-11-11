const { chat } = require('./llm.service');
const { tools: defaultTools } = require('./tools');

function createAgent({ system, tools = defaultTools }) {
  return async (input, history = []) => {
    const messages = [...history, { role: 'user', content: input }];
    return chat({ system, messages, tools });
  };
}

const soporte = createAgent({
  system:
    'Eres un agente de soporte académico y asistente de notas. Responde en español de forma clara, estructurada y concisa.',
});

const analistaNotas = createAgent({
  system:
    'Eres un agente analista de notas. Tu objetivo es extraer conclusiones, tareas pendientes y conceptos clave del texto proporcionado.',
});

module.exports = { createAgent, soporte, analistaNotas };
