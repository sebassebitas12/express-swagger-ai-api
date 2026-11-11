const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const app = require('./app');
const { initDatabase } = require('./config/database');

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`🚀 API en http://localhost:${PORT}/api-docs`);
  try {
    await initDatabase();
  } catch (err) {
    console.warn(`⚠️ Aviso MySQL (${err.message}): escribe tu contraseña en DB_PASSWORD= dentro de .env`);
  }
});
