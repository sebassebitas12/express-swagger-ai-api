const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mysql = require('mysql2/promise');

// Configuración de conexión a MySQL (toma los datos de .env o de estos valores por defecto)
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '', // <--- Puedes poner tu contraseña en .env (DB_PASSWORD=) o aquí
  database: process.env.DB_NAME || 'lab5_notas_db',
};

let pool = null;
let initialized = false;

async function initDatabase() {
  if (initialized && pool) return pool;

  // 1. Conectar al servidor MySQL para crear la base de datos si no existe
  const connection = await mysql.createConnection({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
  });

  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
  );
  await connection.end();

  // 2. Crear el pool de conexiones apuntando a la base de datos
  pool = mysql.createPool({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
    waitForConnections: true,
    connectionLimit: 10,
  });

  // 3. Crear las 5 tablas relacionales en MySQL automáticamente
  await pool.query(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(100) NOT NULL,
      email VARCHAR(120) NOT NULL UNIQUE,
      rol VARCHAR(50) DEFAULT 'estudiante',
      creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS categorias (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(80) NOT NULL,
      descripcion VARCHAR(255) DEFAULT '',
      color VARCHAR(20) DEFAULT '#3b82f6',
      creada_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS notas (
      id INT AUTO_INCREMENT PRIMARY KEY,
      titulo VARCHAR(100) NOT NULL,
      contenido TEXT NOT NULL,
      prioridad VARCHAR(20) DEFAULT 'media',
      estado VARCHAR(20) DEFAULT 'activa',
      usuario_id INT NULL,
      categoria_id INT NULL,
      creada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_nota_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
      CONSTRAINT fk_nota_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS etiquetas (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(50) NOT NULL,
      nota_id INT NOT NULL,
      creada_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_etiqueta_nota FOREIGN KEY (nota_id) REFERENCES notas(id) ON DELETE CASCADE
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS historial_ia (
      id INT AUTO_INCREMENT PRIMARY KEY,
      tipo VARCHAR(50) NOT NULL,
      prompt TEXT NOT NULL,
      respuesta TEXT NOT NULL,
      input_tokens INT DEFAULT 0,
      output_tokens INT DEFAULT 0,
      creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 4. Insertar datos semilla iniciales si la base de datos está recién creada
  const [usersCount] = await pool.query('SELECT COUNT(*) AS total FROM usuarios');
  if (usersCount[0].total === 0) {
    await pool.query(
      `INSERT INTO usuarios (nombre, email, rol) VALUES
       ('Alejandro Zúñiga', 'alejandro@universidad.edu', 'admin'),
       ('María López', 'maria@universidad.edu', 'estudiante')`
    );
  }

  const [catCount] = await pool.query('SELECT COUNT(*) AS total FROM categorias');
  if (catCount[0].total === 0) {
    await pool.query(
      `INSERT INTO categorias (nombre, descripcion, color) VALUES
       ('Programación Backend', 'Apuntes de Express, REST y bases de datos', '#10b981'),
       ('Inteligencia Artificial', 'Integración de LLMs, prompts y agentes', '#8b5cf6'),
       ('Tareas y Proyectos', 'Pendientes y entregas de laboratorio', '#f59e0b')`
    );
  }

  const [notasCount] = await pool.query('SELECT COUNT(*) AS total FROM notas');
  if (notasCount[0].total === 0) {
    await pool.query(
      `INSERT INTO notas (titulo, contenido, prioridad, estado, usuario_id, categoria_id) VALUES
       ('Arquitectura REST con Express', 'REST utiliza métodos HTTP (GET, POST, PUT, PATCH, DELETE), códigos de estado semánticos y formato JSON para comunicar el cliente con el servidor.', 'alta', 'activa', 1, 1),
       ('Integración segura de IA en Backend', 'La API key nunca debe exponerse en el frontend. El servidor lee la clave desde variables de entorno (.env) y centraliza las llamadas en llm.service.js.', 'alta', 'activa', 1, 2)`
    );
    await pool.query(
      `INSERT INTO etiquetas (nombre, nota_id) VALUES
       ('express', 1),
       ('rest-api', 1),
       ('deepseek', 2),
       ('seguridad', 2)`
    );
  }

  initialized = true;
  console.log(`✅ MySQL conectado correctamente a la base de datos "${dbConfig.database}"`);
  return pool;
}

async function getPool() {
  if (!initialized || !pool) {
    await initDatabase();
  }
  return pool;
}

module.exports = { dbConfig, initDatabase, getPool };
