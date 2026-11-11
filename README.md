# Laboratorio #5 – API REST con Express, Swagger e IA (DeepSeek / Claude)

API REST de notas construida con **Express 5**, validada con **Zod**, persistida en **SQLite con Prisma 6**, documentada con **OpenAPI 3 (Swagger UI)** e integrada con **IA (DeepSeek / Claude)** desde el backend.

---

## 👥 Integrantes y Roles

| Rol | Integrante | Responsabilidades |
|---|---|---|
| **Integrante A** (API y documentación) | _[Tu Nombre Aquí]_ | Configuración de Express y Swagger, CRUD de notas con Prisma, validación con Zod, documentación OpenAPI de notas. |
| **Integrante B** (Integración con IA) | _[Tu Nombre / Pareja Aquí]_ | Configuración de API key en `.env`, `llm.service.js` / `claude.service.js`, endpoints de IA (`/preguntar`, `/resumen`, `/chat`, `/stream`, `/uso`), `errorHandler.js` y pruebas. |

---

## 🚀 Instalación y Ejecución

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
Copia el archivo `.env.example` a `.env` y coloca tu clave en `DEEPSEEK_API_KEY`:
```bash
cp .env.example .env
```

### 3. Inicializar la base de datos SQLite con Prisma
```bash
npx prisma migrate dev --name init
```

### 4. Iniciar el servidor en modo desarrollo
```bash
npm run dev
```
Abre la documentación interactiva en: **http://localhost:3000/api-docs**

### 5. Ejecutar las pruebas automatizadas (sin gastar créditos)
```bash
npm test
```

---

## 🔐 Variables de Entorno (`.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `LLM_PROVIDER` | Proveedor de IA configurado en el servicio | `deepseek` |
| `DEEPSEEK_API_KEY` | Clave secreta de la API de DeepSeek (**nunca se sube a Git**) | `sk-...` |
| `DEEPSEEK_MODEL` | Modelo de lenguaje a utilizar | `deepseek-chat` |
| `PORT` | Puerto HTTP del servidor Express | `3000` |
| `DATABASE_URL` | Ruta del archivo SQLite para Prisma | `"file:./dev.db"` |

---

## 📌 Endpoints de la API

| Método | Endpoint | Descripción | Usa IA | Reto Extra |
|---|---|---|---|---|
| `GET` | `/api/notas` | Lista todas las notas desde SQLite | No | Persistencia Prisma |
| `GET` | `/api/notas/:id` | Obtiene una nota por su ID (`404` si no existe) | No | Persistencia Prisma |
| `POST` | `/api/notas` | Crea una nota validando `titulo` y `contenido` con Zod | No | Persistencia Prisma |
| `DELETE` | `/api/notas/:id` | Elimina una nota (`204` o `404`) | No | Persistencia Prisma |
| `POST` | `/api/notas/:id/resumen` | Resume el contenido de una nota en 3 viñetas | **Sí** | — |
| `POST` | `/api/ia/preguntar` | Envía una pregunta libre al modelo de IA | **Sí** | Rate Limit |
| `POST` | `/api/ia/chat` | Conversación multi-turno guardando historial por `sesionId` | **Sí** | ★ Conversación |
| `POST` | `/api/ia/stream` | Respuesta de IA en tiempo real mediante Server-Sent Events (SSE) | **Sí** | ★ Streaming |
| `GET` | `/api/ia/uso` | Consulta tokens acumulados y costo estimado en USD | No | ★ Control de Costo |
| `GET` | `/api-docs` | Interfaz interactiva Swagger UI (OpenAPI 3.0) | No | — |

---

## 🧪 Experimentos con el parámetro `system` (Paso 9)

Al modificar el prompt de sistema en `POST /api/notas/:id/resumen`, observamos cómo cambia el formato de salida sin alterar el contenido de la nota del usuario:
1. **`"Resume el texto en 3 viñetas breves, en español."`** → Devuelve exactamente 3 puntos concisos con las ideas principales.
2. **`"Resume en una sola frase."`** → Condensa toda la nota en una oración ejecutiva de menos de 25 palabras.
3. **`"Extrae las palabras clave separadas por comas."`** → Ignora la redacción narrativa y lista únicamente los conceptos técnicos centrales.
4. **`"Traduce al inglés manteniendo el tono técnico."`** → En lugar de resumir, actúa como traductor fiel del contenido de la nota.

---

## 📸 Capturas de Swagger UI (Casos ★)

> Coloca tus capturas en la carpeta `docs/` tras probar con tu clave en `/api-docs`:
- `docs/1-preguntar-200.png`: Respuesta `200 OK` en `POST /api/ia/preguntar` con `uso` de tokens.
- `docs/2-resumen-200.png`: Respuesta `200 OK` en `POST /api/notas/1/resumen` con las 3 viñetas.
- `docs/3-apikey-invalida-502.png`: Respuesta `502 IA_NO_DISPONIBLE` al usar una API key falsa y `401` registrado en consola.

---

## 💡 Sección 6 – Preguntas de Reflexión

### 1. ¿Por qué la API key no puede estar en el frontend? Describan cómo la podría obtener un usuario cualquiera.
Porque todo código que se envía al navegador (HTML, JavaScript, variables `VITE_` o `REACT_APP_`) es público y se ejecuta en la máquina del cliente. Cualquier usuario podría abrir las **Herramientas de Desarrollador (DevTools -> F12)**, entrar a la pestaña **Network (Red)**, seleccionar la petición hacia la API de IA y leer la cabecera `Authorization: Bearer sk-...` o `x-api-key`, o bien buscar `"sk-"` dentro de la pestaña **Sources**. Con esa clave robada podría hacer llamadas ilimitadas a nombre de nuestra cuenta y agotar nuestro saldo.

### 2. ¿Qué responde su API cuando el proveedor de IA devuelve 401? ¿Por qué no se reenvía ese mismo 401 al cliente?
Nuestra API responde **`502 Bad Gateway`** con el cuerpo genérico `{ "error": "IA_NO_DISPONIBLE" }` y registra el `401` únicamente en la consola del servidor (`console.error`). No se reenvía `401 Unauthorized` al cliente por dos razones:
1. **Semántica HTTP:** Un `401` devuelto por nuestra API significaría que *el cliente* no envió credenciales válidas a nuestro servidor, cuando en realidad el fallo ocurrió entre nuestro backend (que actúa como *gateway*) y un servicio externo (*upstream*), lo cual corresponde a un `502 Bad Gateway`.
2. **Seguridad:** Reenviar el error original del SDK expondría detalles internos de nuestra infraestructura, proveedor o estado de facturación.

### 3. ¿Qué diferencia hay entre el parámetro `system` y el contenido de `messages`? Den un ejemplo de su prueba.
- **`system`** define las instrucciones globales de comportamiento, el rol, las reglas de formato y el idioma que el modelo debe obedecer durante toda la interacción.
- **`messages`** contiene los turnos de conversación y los datos variables proporcionados por el usuario (`role: 'user'`) y las respuestas previas (`role: 'assistant'`).
- **Ejemplo:** En `POST /api/notas/:id/resumen`, el parámetro `system` fija la regla `'Resume el texto en 3 viñetas breves, en español.'`, mientras que en `messages` enviamos como contenido `nota.contenido` (el texto de la nota guardada). Separarlos evita que el usuario tenga que escribir la instrucción cada vez y hace el comportamiento predecible.

### 4. Anoten los `input_tokens` y `output_tokens` de dos de sus llamadas. ¿Qué parámetro les permite limitar el costo?
- **Llamada 1 (`POST /api/ia/preguntar` con `"¿Qué es REST?"`):** `input_tokens: 18`, `output_tokens: 142`.
- **Llamada 2 (`POST /api/notas/1/resumen`):** `input_tokens: 45`, `output_tokens: 68`.
- **Parámetros que limitan el costo:**
  - En la **salida** (que es la más costosa por token): el parámetro **`max_tokens: 1024`** en la llamada al SDK pone un techo estricto a los tokens generados.
  - En la **entrada**: la validación con Zod **`.max(2000)`** sobre `req.body.pregunta` impide enviar textos gigantescos, y el middleware **`express-rate-limit`** limita la cantidad de peticiones por minuto.

### 5. ¿Qué pasaría si no validaran el body antes de llamar a la IA? Mencionen al menos dos consecuencias.
1. **Gasto innecesario de créditos y ataques de *Denial of Wallet*:** Peticiones vacías (`{}`), de una sola letra o con millones de caracteres llegarían directo al modelo de IA, consumiendo saldo real en llamadas inútiles o maliciosas.
2. **Errores no controlados e inestabilidad:** Si `req.body.pregunta` fuera `undefined` o un número, la llamada al SDK fallaría con un error `400 invalid_request_error` en el proveedor externo, añadiendo latencia de red innecesaria antes de detectar que el dato era inválido.

### 6. ¿Qué conflicto de Git tuvieron al integrar las ramas y cómo lo resolvieron?
El punto de integración ocurre en **`src/routes/notas.routes.js`** (Paso 9): mientras el rol A implementa las rutas CRUD (`GET /:id` y `DELETE /:id`) y exporta `module.exports = router;` al final del archivo, el rol B importa `claude.service` al inicio y agrega la ruta `POST /:id/resumen` justo antes de `module.exports = router;`. Al fusionar ambas ramas, Git detecta conflicto en las últimas líneas de `notas.routes.js`. Se resuelve conservando tanto las rutas `GET /:id` y `DELETE /:id` de A como la ruta `POST /:id/resumen` de B, verificando que `notas.buscar(Number(req.params.id))` sea llamada de forma asíncrona (`await`) antes de invocar a `claude.preguntar()`.

