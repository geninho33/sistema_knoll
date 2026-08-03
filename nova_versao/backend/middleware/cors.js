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
  // Por padrão relaxado: frontend e API no mesmo Nginx (IP:8089 → /api).
  // Defina CORS_STRICT=1 para exigir lista explícita em CORS_ORIGINS.
  const strict = String(process.env.CORS_STRICT || '').trim() === '1';

  return cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowed.has('*') || allowed.has(origin)) return callback(null, true);
      if (process.env.NODE_ENV !== 'production') return callback(null, true);
      if (!strict) {
        // Reflete a Origin da requisição (adequado ao proxy same-host)
        return callback(null, true);
      }
      return callback(new Error(`CORS bloqueado para origem: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    optionsSuccessStatus: 204,
  });
}

module.exports = { corsMiddleware, DEV_ORIGINS };
