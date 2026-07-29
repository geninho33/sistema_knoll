const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { getClientIp, getUserAgent, loadUserPermissions, authMiddleware } = require('../middleware/auth');
const { registrarAcesso, registrarAuditoria, verificarHorarioAcesso } = require('../utils/audit');

const router = express.Router();

async function getProfilePayload(cdUsrs) {
  const [rows] = await db.query(
    `
    SELECT u.cd_usrs, u.nm_usrs AS nome, u.nm_logn AS login, u.ds_email AS email_legado,
           su.id AS sys_id, su.email, su.status, su.perfil_id,
           p.nome AS perfil_nome
    FROM knoll_usuarios u
    LEFT JOIN sys_usuarios su ON su.cd_usrs = u.cd_usrs AND su.deleted_at IS NULL
    LEFT JOIN sys_perfis p ON p.id = su.perfil_id
    WHERE u.cd_usrs = ?
  `,
    [cdUsrs]
  );
  const user = rows[0];
  if (!user) return null;

  const [ultimo] = await db.query(
    `
    SELECT data_hora FROM sys_acessos
    WHERE (usuario_id = ? OR login = ?) AND acao = 'login' AND status = 'sucesso'
    ORDER BY data_hora DESC LIMIT 1
  `,
    [user.sys_id || 0, user.login]
  );

  return {
    id: user.cd_usrs,
    sysId: user.sys_id,
    name: user.nome || user.login,
    login: user.login,
    email: user.email || user.email_legado || '',
    perfilId: user.perfil_id,
    perfilNome: user.perfil_nome || null,
    status: user.status || 'A',
    ultimoAcesso: ultimo[0]?.data_hora || null,
  };
}


router.post('/login', async (req, res) => {
  const ip = getClientIp(req);
  const navegador = getUserAgent(req);
  const { usuario, senha } = req.body || {};

  try {
    if (!usuario || !senha) {
      return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
    }

    const [rows] = await db.execute(
      'SELECT * FROM knoll_usuarios WHERE nm_logn = ?',
      [usuario]
    );
    const user = rows[0];

    if (!user) {
      await registrarAcesso({
        login: usuario,
        ip,
        navegador,
        status: 'falha',
        detalhes: 'Usuário não encontrado',
      });
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    // Garante registro em sys_usuarios
    const [sysRows] = await db.query(
      'SELECT * FROM sys_usuarios WHERE cd_usrs = ?',
      [user.cd_usrs]
    );
    let sysUser = sysRows[0];
    if (!sysUser) {
      await db.query(
        `INSERT INTO sys_usuarios (cd_usrs, perfil_id, email, status) VALUES (?, 2, ?, 'A')`,
        [user.cd_usrs, user.ds_email || null]
      );
      const [created] = await db.query(
        'SELECT * FROM sys_usuarios WHERE cd_usrs = ?',
        [user.cd_usrs]
      );
      sysUser = created[0];
    }

    const statusOk = !sysUser.deleted_at && ['A', 'ATIVO', 'ACTIVE', '1'].includes(String(sysUser.status || '').trim().toUpperCase());
    if (!statusOk) {
      await registrarAcesso({
        usuarioId: sysUser.id,
        login: usuario,
        ip,
        navegador,
        status: 'falha',
        detalhes: 'Usuário inativo',
      });
      return res.status(403).json({
        error: 'Acesso negado. Seu usuário encontra-se inativo no sistema.',
        code: 'USER_INACTIVE',
      });
    }

    if (user.cd_pass !== senha) {
      await registrarAcesso({
        usuarioId: sysUser.id,
        login: usuario,
        ip,
        navegador,
        status: 'falha',
        detalhes: 'Senha incorreta',
      });
      return res.status(401).json({ error: 'Senha incorreta' });
    }

    const horario = await verificarHorarioAcesso(user.cd_usrs);
    if (!horario.permitido) {
      await registrarAcesso({
        usuarioId: sysUser.id,
        login: usuario,
        ip,
        navegador,
        status: 'fora_horario',
        detalhes: horario.motivo,
      });
      await registrarAuditoria({
        usuarioId: sysUser.id,
        usuarioNome: user.nm_usrs || user.nm_logn,
        operacao: 'LOGIN',
        tabela: 'knoll_usuarios',
        registroId: user.cd_usrs,
        valoresNovos: { resultado: 'fora_horario', motivo: horario.motivo },
        ip,
      });
      return res.status(403).json({
        error: 'Acesso bloqueado fora do horário permitido',
        detalhe: horario.motivo,
      });
    }

    const permissions = await loadUserPermissions(user.cd_usrs);
    const token = jwt.sign(
      {
        id: user.cd_usrs,
        sysId: sysUser.id,
        username: user.nm_logn,
        perfilId: sysUser.perfil_id,
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    await registrarAcesso({
      usuarioId: sysUser.id,
      login: usuario,
      ip,
      navegador,
      status: 'sucesso',
      detalhes: 'Login bem-sucedido',
    });
    await registrarAuditoria({
      usuarioId: sysUser.id,
      usuarioNome: user.nm_usrs || user.nm_logn,
      operacao: 'LOGIN',
      tabela: 'knoll_usuarios',
      registroId: user.cd_usrs,
      valoresNovos: { resultado: 'sucesso' },
      ip,
    });

    const [perfil] = await db.query('SELECT nome FROM sys_perfis WHERE id = ?', [
      sysUser.perfil_id,
    ]);

    res.json({
      message: 'Login bem-sucedido',
      token,
      user: {
        id: user.cd_usrs,
        sysId: sysUser.id,
        name: user.nm_usrs || user.nm_logn,
        login: user.nm_logn,
        email: sysUser.email || user.ds_email,
        perfilId: sysUser.perfil_id,
        perfilNome: perfil[0]?.nome || null,
        permissions: permissions.map((p) => p.codigo),
      },
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// Perfil do usuário autenticado
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const profile = await getProfilePayload(req.user.id);
    if (!profile) return res.status(404).json({ error: 'Usuário não encontrado' });
    const permissions = await loadUserPermissions(req.user.id);
    res.json({ ...profile, permissions: permissions.map((p) => p.codigo) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/me', authMiddleware, async (req, res) => {
  try {
    const { name, email } = req.body || {};
    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }

    const [antes] = await db.query(
      `SELECT nm_usrs, ds_email FROM knoll_usuarios WHERE cd_usrs = ?`,
      [req.user.id]
    );

    await db.query(
      `UPDATE knoll_usuarios SET nm_usrs = ?, ds_email = ? WHERE cd_usrs = ?`,
      [String(name).trim(), email || null, req.user.id]
    );
    await db.query(
      `UPDATE sys_usuarios SET email = ? WHERE cd_usrs = ? AND deleted_at IS NULL`,
      [email || null, req.user.id]
    );

    await registrarAuditoria({
      usuarioId: req.user.sysId,
      usuarioNome: req.user.username,
      tabela: 'knoll_usuarios',
      registroId: req.user.id,
      operacao: 'UPDATE',
      valoresAnteriores: antes[0] || null,
      valoresNovos: { nome: name, email },
      ip: req.clientIp,
    });

    const profile = await getProfilePayload(req.user.id);
    res.json({ success: true, user: profile });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/me/senha', authMiddleware, async (req, res) => {
  try {
    const { senha_atual, nova_senha, confirmar_senha } = req.body || {};

    if (!senha_atual || !nova_senha || !confirmar_senha) {
      return res.status(400).json({ error: 'Preencha todos os campos de senha' });
    }
    if (nova_senha !== confirmar_senha) {
      return res.status(400).json({ error: 'A confirmação da nova senha não confere' });
    }
    if (String(nova_senha).length < 4) {
      return res.status(400).json({ error: 'A nova senha deve ter no mínimo 4 caracteres' });
    }
    if (String(nova_senha).length > 6) {
      return res.status(400).json({ error: 'A senha pode ter no máximo 6 caracteres (compatibilidade do sistema)' });
    }

    const [rows] = await db.query(
      `SELECT cd_pass FROM knoll_usuarios WHERE cd_usrs = ?`,
      [req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Usuário não encontrado' });
    if (rows[0].cd_pass !== senha_atual) {
      return res.status(401).json({ error: 'Senha atual incorreta' });
    }

    await db.query(`UPDATE knoll_usuarios SET cd_pass = ? WHERE cd_usrs = ?`, [
      String(nova_senha).substring(0, 6),
      req.user.id,
    ]);

    await registrarAuditoria({
      usuarioId: req.user.sysId,
      usuarioNome: req.user.username,
      tabela: 'knoll_usuarios',
      registroId: req.user.id,
      operacao: 'SENHA',
      valoresNovos: { resultado: 'senha_alterada' },
      ip: req.clientIp,
    });

    res.json({ success: true, message: 'Senha alterada com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/logout', async (req, res) => {
  try {
    const ip = getClientIp(req);
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    let payload = null;
    if (token) {
      try {
        payload = jwt.verify(token, process.env.JWT_SECRET);
      } catch (_) {
        /* ignore */
      }
    }

    if (payload) {
      await registrarAcesso({
        usuarioId: payload.sysId || null,
        login: payload.username,
        ip,
        navegador: getUserAgent(req),
        acao: 'logout',
        status: 'sucesso',
        detalhes: 'Logout',
      });
      await registrarAuditoria({
        usuarioId: payload.sysId || null,
        usuarioNome: payload.username,
        operacao: 'LOGOUT',
        tabela: 'knoll_usuarios',
        registroId: payload.id,
        ip,
      });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
