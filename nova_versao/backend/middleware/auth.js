const jwt = require('jsonwebtoken');
const db = require('../db');

function getClientIp(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    null
  );
}

function getUserAgent(req) {
  return (req.headers['user-agent'] || '').substring(0, 255);
}

async function authMiddleware(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
      return res.status(401).json({ error: 'Token não informado' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    req.clientIp = getClientIp(req);
    req.userAgent = getUserAgent(req);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
}

async function optionalAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (token) {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    }
  } catch (_) {
    /* ignore */
  }
  req.clientIp = getClientIp(req);
  req.userAgent = getUserAgent(req);
  next();
}

async function loadUserPermissions(cdUsrs) {
  const [rows] = await db.query(
    `
    SELECT p.codigo, p.tipo, m.codigo AS menu_codigo
    FROM sys_usuarios su
    JOIN sys_perfil_permissoes pp ON pp.perfil_id = su.perfil_id
    JOIN sys_permissoes p ON p.id = pp.permissao_id
    JOIN sys_menus m ON m.id = p.menu_id
    WHERE su.cd_usrs = ? AND su.status = 'A' AND su.deleted_at IS NULL
  `,
    [cdUsrs]
  );
  return rows;
}

function requirePermission(codigo) {
  return async (req, res, next) => {
    try {
      if (!req.user?.id) return res.status(401).json({ error: 'Não autenticado' });

      const perms = await loadUserPermissions(req.user.id);
      req.permissions = perms.map((p) => p.codigo);

      // Administrador (perfil 1) ou permissão explícita
      const [perfil] = await db.query(
        `SELECT perfil_id FROM sys_usuarios WHERE cd_usrs = ? AND deleted_at IS NULL`,
        [req.user.id]
      );

      if (perfil[0]?.perfil_id === 1 || req.permissions.includes(codigo)) {
        return next();
      }

      return res.status(403).json({ error: 'Sem permissão para esta operação' });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  };
}

module.exports = {
  authMiddleware,
  optionalAuth,
  requirePermission,
  loadUserPermissions,
  getClientIp,
  getUserAgent,
};
