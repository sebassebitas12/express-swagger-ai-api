const OpenAI = require('openai');
const { AppError } = require('../utils/errors');

module.exports = (err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: err.message });
  }

  // Errores del SDK de IA (OpenAI / DeepSeek o simulados con status)
  if (err instanceof OpenAI.APIError || err.isLLMError) {
    console.error('LLM API:', err.status, err.message);
    const status = err.status === 429 ? 429
      : (err.status === 529 || err.status === 503) ? 503 : 502;
    return res.status(status).json({ error: 'IA_NO_DISPONIBLE' });
  }

  console.error(err);
  res.status(500).json({ error: 'Error interno' });
};

