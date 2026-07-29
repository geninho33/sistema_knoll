const jwt = require('jsonwebtoken');
const db = require('../db');

const MSG_INATIVO = 'Acesso negado. Seu usuário encontra-se inativo no sistema.';

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

function isActiveStatus(status) {
  if (!status) return false;
  const s = String(status).trim().toLowerCase();
  return s === 'a' || s === 'ativo' || s === 'active' || s === '1';
}

async function getSysUserByCd(cdUsrs) {
  const [rows] = await db.query(
    `SELECT id, cd_usrs, perfil_id, status, deleted_at
     FROM sys_usuarios
     WHERE cd_usrs = ?
     LIMIT 1`,
    [cdUsrs]
  );
  return rows[0] || null;
}

async function assertUserActive(cdUsrs) {
  const sysUser = await getSysUserByCd(cdUsrs);
  if (!sysUser || sysUser.deleted_at || !isActiveStatus(sysUser.status)) {
    const err = new Error(MSG_INATIVO);
    err.statusCode = 403;
    err.code = 'USER_INACTIVE';
    throw err;
  }
  return sysUser;
}

async function authMiddleware(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
      return res.status(401).json({ error: 'Token não informado', code: 'NO_TOKEN' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const sysUser = await assertUserActive(payload.id);

    req.user = {
      ...payload,
      sysId: sysUser.id,
      perfilId: sysUser.perfil_id,
      status: sysUser.status,
    };
    req.clientIp = getClientIp(req);
    req.userAgent = getUserAgent(req);
    next();
  } catch (err) {
    if (err.code === 'USER_INACTIVE') {
      return res.status(403).json({ error: MSG_INATIVO, code: 'USER_INACTIVE' });
    }
    return res.status(401).json({ error: 'Token inválido ou expirado', code: 'INVALID_TOKEN' });
  }
}

async function optionalAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (token) {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const sysUser = await getSysUserByCd(payload.id);
      if (sysUser && !sysUser.deleted_at && isActiveStatus(sysUser.status)) {
        req.user = { ...payload, sysId: sysUser.id, perfilId: sysUser.perfil_id, status: sysUser.status };
      }
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

      const [perfil] = await db.query(
        `SELECT perfil_id, status, deleted_at FROM sys_usuarios WHERE cd_usrs = ?`,
        [req.user.id]
      );

      if (!perfil[0] || perfil[0].deleted_at || !isActiveStatus(perfil[0].status)) {
        return res.status(403).json({ error: MSG_INATIVO, code: 'USER_INACTIVE' });
      }

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
  isActiveStatus,
  assertUserActive,
  MSG_INATIVO,
};
