const OpenAI = require('openai');

let clientInstance = null;

function getClient() {
  const apiKey = process.env.DEEPSEEK_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    const err = new Error('API key ausente en variables de entorno');
    err.status = 401;
    err.isLLMError = true;
    throw err;
  }
  if (!clientInstance || clientInstance._apiKey !== apiKey) {
    clientInstance = new OpenAI({
      baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
      apiKey,
    });
    clientInstance._apiKey = apiKey;
  }
  return clientInstance;
}

const DEFAULT_SYSTEM = 'Eres un asistente útil. Responde en español.';

// Registro acumulado de uso y costo estimado (Reto extra: Costo)
// Precios orientativos DeepSeek Chat: $0.27 / 1M input tokens, $1.10 / 1M output tokens
const estadisticasUso = {
  llamadas: 0,
  input_tokens: 0,
  output_tokens: 0,
  costo_estimado_usd: 0,
};

function registrarUso(usage) {
  if (!usage) return { input_tokens: 0, output_tokens: 0 };
  const input = usage.input_tokens ?? usage.prompt_tokens ?? 0;
  const output = usage.output_tokens ?? usage.completion_tokens ?? 0;
  estadisticasUso.llamadas += 1;
  estadisticasUso.input_tokens += input;
  estadisticasUso.output_tokens += output;
  const costo = (input * 0.27 + output * 1.10) / 1_000_000;
  estadisticasUso.costo_estimado_usd = Number(
    (estadisticasUso.costo_estimado_usd + costo).toFixed(8)
  );
  return { input_tokens: input, output_tokens: output };
}

function obtenerEstadisticasUso() {
  return { ...estadisticasUso };
}

async function chat({ system = DEFAULT_SYSTEM, messages }) {
  const client = getClient();
  const model = process.env.DEEPSEEK_MODEL || process.env.CLAUDE_MODEL || 'deepseek-chat';
  const r = await client.chat.completions.create({
    model,
    max_tokens: 1024,
    messages: [{ role: 'system', content: system }, ...messages],
  });
  const texto = r.choices?.[0]?.message?.content ?? '';
  const uso = registrarUso(r.usage);
  return { respuesta: texto, uso };
}

async function preguntar(texto, system) {
  return chat({
    system: system ?? DEFAULT_SYSTEM,
    messages: [{ role: 'user', content: texto }],
  });
}

async function* preguntarStream(texto, system = DEFAULT_SYSTEM) {
  const client = getClient();
  const model = process.env.DEEPSEEK_MODEL || process.env.CLAUDE_MODEL || 'deepseek-chat';
  const stream = await client.chat.completions.create({
    model,
    max_tokens: 1024,
    stream: true,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: texto },
    ],
  });
  for await (const chunk of stream) {
    const delta = chunk.choices?.[0]?.delta?.content;
    if (delta) yield delta;
  }
}

module.exports = {
  chat,
  preguntar,
  preguntarStream,
  obtenerEstadisticasUso,
};

