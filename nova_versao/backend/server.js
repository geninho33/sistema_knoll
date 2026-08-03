const express = require('express');
const path = require('path');
require('dotenv').config();

const { corsMiddleware } = require('./middleware/cors');
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');
const adminRoutes = require('./routes/admin');
const reportsRoutes = require('./routes/reports');
const agendaRoutes = require('./routes/agenda');
const configuracaoRoutes = require('./routes/configuracao');

const app = express();

app.use(corsMiddleware());
app.options('*', corsMiddleware());
app.use(express.json({ limit: '2mb' }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/relatorios', reportsRoutes);
app.use('/api/agenda', agendaRoutes);
app.use('/api/configuracao', configuracaoRoutes);
app.use('/api/v1/configuracao', configuracaoRoutes);
app.use('/api', apiRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API rodando perfeitamente!' });
});

// Erros do middleware CORS (lista restrita) → JSON em vez de HTML genérico
app.use((err, _req, res, next) => {
  if (!err) return next();
  if (String(err.message || '').startsWith('CORS bloqueado')) {
    return res.status(403).json({ error: err.message, code: 'CORS_BLOCKED' });
  }
  console.error('Erro não tratado:', err);
  return res.status(500).json({ error: 'Erro interno no servidor', detalhe: err.message });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
