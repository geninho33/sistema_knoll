const cors = require('cors');

const DEV_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
];

function corsMiddleware() {
  return cors({
    origin(origin, callback) {
      // Permite tools sem Origin (curl/Postman) e origins de desenvolvimento
      if (!origin || DEV_ORIGINS.includes(origin) || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      if (DEV_ORIGINS.includes(origin)) {
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
