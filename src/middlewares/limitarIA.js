const rateLimit = require('express-rate-limit');

const limitarIA = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10, // máximo 10 peticiones por minuto
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'DEMASIADAS_PETICIONES' },
});

module.exports = limitarIA;

