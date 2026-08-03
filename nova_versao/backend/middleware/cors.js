const cors = require('cors');

const DEV_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
  'http://localhost:8089',
  'http://127.0.0.1:8089',
];

function parseExtraOrigins() {
  const raw = process.env.CORS_ORIGINS || process.env.CORS_ORIGIN || '';
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function corsMiddleware() {
  const allowed = new Set([...DEV_ORIGINS, ...parseExtraOrigins()]);

  return cors({
    origin(origin, callback) {
      // Sem Origin (curl/Postman/healthchecks) ou same-origin via proxy nginx
      if (!origin) return callback(null, true);
      if (process.env.NODE_ENV !== 'production') return callback(null, true);
      if (allowed.has(origin) || allowed.has('*')) return callback(null, true);
      return callback(new Error(`CORS bloqueado para origem: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    optionsSuccessStatus: 204,
  });
}

module.exports = { corsMiddleware, DEV_ORIGINS };
