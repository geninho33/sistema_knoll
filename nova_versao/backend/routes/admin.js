const express = require('express');
const db = require('../db');
const { authMiddleware, requirePermission } = require('../middleware/auth');
const { registrarAuditoria } = require('../utils/audit');
const { hashPassword, legacyPlainPassword } = require('../utils/password');

const router = express.Router();
router.use(authMiddleware);

const DIAS = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda' },
  { value: 2, label: 'Terça' },
  { value: 3, label: 'Quarta' },
  { value: 4, label: 'Quinta' },
  { value: 5, label: 'Sexta' },
  { value: 6, label: 'Sábado' },
];

// ---------- Menus / Permissões (árvore) ----------
router.get('/menus', requirePermission('admin_perfis.consulta'), async (req, res) => {
  try {
    const [menus] = await db.query(
      `SELECT * FROM sys_menus WHERE ativo = 1 ORDER BY COALESCE(menu_pai_id, 0), ordem, id`
    );
    const [perms] = await db.query(`SELECT * FROM sys_permissoes ORDER BY menu_id, tipo`);

    const byParent = {};
    menus.forEach((m) => {
      const key = m.menu_pai_id || 0;
      if (!byParent[key]) byParent[key] = [];
      byParent[key].push({
        ...m,
        permissoes: perms.filter((p) => p.menu_id === m.id),
        children: [],
      });
    });

    const build = (paiId) =>
      (byParent[paiId] || []).map((node) => ({
        ...node,
        children: build(node.id),
      }));

    res.json({ tree: build(0), flat: menus, dias: DIAS });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------- Perfis ----------
router.get('/perfis', requirePermission('admin_perfis.consulta'), async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.*, (SELECT COUNT(*) FROM sys_usuarios u WHERE u.perfil_id = p.id AND u.deleted_at IS NULL) AS usuarios
       FROM sys_perfis p WHERE p.deleted_at IS NULL ORDER BY p.nome`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/perfis/:id', requirePermission('admin_perfis.consulta'), async (req, res) => {
  try {
    const [perfil] = await db.query(
      `SELECT * FROM sys_perfis WHERE id = ? AND deleted_at IS NULL`,
      [req.params.id]
    );
    if (!perfil[0]) return res.status(404).json({ error: 'Perfil não encontrado' });

    const [perms] = await db.query(
      `SELECT permissao_id FROM sys_perfil_permissoes WHERE perfil_id = ?`,
      [req.params.id]
    );
    res.json({ ...perfil[0], permissoes: perms.map((p) => p.permissao_id) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/perfis', requirePermission('admin_perfis.escrita'), async (req, res) => {
  try {
    const { nome, descricao, ativo = 1, permissoes = [] } = req.body;
    if (!nome) return res.status(400).json({ error: 'Nome é obrigatório' });

    const [result] = await db.query(
      `INSERT INTO sys_perfis (nome, descricao, ativo) VALUES (?, ?, ?)`,
      [nome, descricao || null, ativo ? 1 : 0]
    );
    const perfilId = result.insertId;

    for (const permId of permissoes) {
      await db.query(
        `INSERT INTO sys_perfil_permissoes (perfil_id, permissao_id) VALUES (?, ?)`,
        [perfilId, permId]
      );
    }

    await registrarAuditoria({
      usuarioId: req.user.sysId,
      usuarioNome: req.user.username,
      tabela: 'sys_perfis',
      registroId: perfilId,
      operacao: 'INSERT',
      valoresNovos: { nome, descricao, ativo, permissoes },
      ip: req.clientIp,
    });

    res.json({ success: true, id: perfilId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/perfis/:id', requirePermission('admin_perfis.escrita'), async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao, ativo = 1, permissoes = [] } = req.body;

    const [antes] = await db.query(`SELECT * FROM sys_perfis WHERE id = ?`, [id]);
    const [permsAntes] = await db.query(
      `SELECT permissao_id FROM sys_perfil_permissoes WHERE perfil_id = ?`,
      [id]
    );

    await db.query(
      `UPDATE sys_perfis SET nome = ?, descricao = ?, ativo = ? WHERE id = ?`,
      [nome, descricao || null, ativo ? 1 : 0, id]
    );
    await db.query(`DELETE FROM sys_perfil_permissoes WHERE perfil_id = ?`, [id]);
    for (const permId of permissoes) {
      await db.query(
        `INSERT INTO sys_perfil_permissoes (perfil_id, permissao_id) VALUES (?, ?)`,
        [id, permId]
      );
    }

    await registrarAuditoria({
      usuarioId: req.user.sysId,
      usuarioNome: req.user.username,
      tabela: 'sys_perfis',
      registroId: id,
      operacao: 'PERMISSAO',
      valoresAnteriores: {
        ...antes[0],
        permissoes: permsAntes.map((p) => p.permissao_id),
      },
      valoresNovos: { nome, descricao, ativo, permissoes },
      ip: req.clientIp,
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/perfis/:id', requirePermission('admin_perfis.escrita'), async (req, res) => {
  try {
    const { id } = req.params;
    if (Number(id) === 1) {
      return res.status(400).json({ error: 'Perfil Administrador não pode ser excluído' });
    }
    await db.query(`UPDATE sys_perfis SET deleted_at = NOW(), ativo = 0 WHERE id = ?`, [id]);
    await registrarAuditoria({
      usuarioId: req.user.sysId,
      usuarioNome: req.user.username,
      tabela: 'sys_perfis',
      registroId: id,
      operacao: 'DELETE',
      ip: req.clientIp,
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------- Usuários ----------
router.get('/usuarios', requirePermission('admin_usuarios.consulta'), async (req, res) => {
  try {
    const q = req.query.q || '';
    const params = [];
    let where = 'WHERE su.deleted_at IS NULL';
    if (q) {
      where += ' AND (u.nm_usrs LIKE ? OR u.nm_logn LIKE ? OR su.email LIKE ?)';
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }

    const [rows] = await db.query(
      `
      SELECT su.id, su.cd_usrs, su.perfil_id, su.email, su.status,
             u.nm_usrs AS nome, u.nm_logn AS login, u.ds_email AS email_legado,
             u.hr_matt_entr, u.hr_matt_saida, u.hr_vesp_entr, u.hr_vesp_saida,
             p.nome AS perfil_nome
      FROM sys_usuarios su
      JOIN knoll_usuarios u ON u.cd_usrs = su.cd_usrs
      LEFT JOIN sys_perfis p ON p.id = su.perfil_id
      ${where}
      ORDER BY u.nm_usrs
    `,
      params
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/usuarios/:id', requirePermission('admin_usuarios.consulta'), async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT su.id, su.cd_usrs, su.perfil_id, su.email, su.status, su.created_at, su.updated_at,
             u.nm_usrs AS nome, u.nm_logn AS login,
             u.hr_matt_entr, u.hr_matt_saida, u.hr_vesp_entr, u.hr_vesp_saida,
             CASE WHEN su.password_hash IS NOT NULL AND su.password_hash <> '' THEN 1 ELSE 0 END AS tem_hash
      FROM sys_usuarios su
      JOIN knoll_usuarios u ON u.cd_usrs = su.cd_usrs
      WHERE su.id = ? AND su.deleted_at IS NULL
    `,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Usuário não encontrado' });

    const [horarios] = await db.query(
      `SELECT dia_semana, hora_inicio, hora_fim, ativo FROM sys_horarios_acesso WHERE usuario_id = ?`,
      [req.params.id]
    );

    res.json({ ...rows[0], senha: '', horarios, dias: DIAS });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/usuarios', requirePermission('admin_usuarios.escrita'), async (req, res) => {
  const conn = await db.getConnection();
  try {
    const {
      nome,
      login,
      email,
      senha,
      perfil_id,
      status = 'A',
      hr_matt_entr,
      hr_matt_saida,
      hr_vesp_entr,
      hr_vesp_saida,
      horarios = [],
    } = req.body;

    if (!nome || !login || !senha) {
      return res.status(400).json({ error: 'Nome, login e senha são obrigatórios' });
    }

    const [exists] = await conn.query(
      `SELECT cd_usrs FROM knoll_usuarios WHERE nm_logn = ?`,
      [login]
    );
    if (exists[0]) return res.status(400).json({ error: 'Login já cadastrado' });

    await conn.beginTransaction();

    const [maxRow] = await conn.query(`SELECT MAX(cd_usrs) AS maxId FROM knoll_usuarios`);
    const nextId = (maxRow[0].maxId || 0) + 1;

    await conn.query(
      `INSERT INTO knoll_usuarios
        (cd_usrs, nm_usrs, nm_logn, cd_pass, ds_email, in_tipo,
         hr_matt_entr, hr_matt_saida, hr_vesp_entr, hr_vesp_saida)
       VALUES (?, ?, ?, ?, ?, 'C', ?, ?, ?, ?)`,
      [
        nextId,
        nome,
        login,
        legacyPlainPassword(senha),
        email || null,
        hr_matt_entr || null,
        hr_matt_saida || null,
        hr_vesp_entr || null,
        hr_vesp_saida || null,
      ]
    );

    const [ins] = await conn.query(
      `INSERT INTO sys_usuarios (cd_usrs, perfil_id, email, password_hash, status) VALUES (?, ?, ?, ?, ?)`,
      [nextId, perfil_id || 2, email || null, passHash, status === 'I' ? 'I' : 'A']
    );
    const sysId = ins.insertId;

    for (const h of horarios) {
      if (!h.ativo) continue;
      await conn.query(
        `INSERT INTO sys_horarios_acesso (usuario_id, dia_semana, hora_inicio, hora_fim, ativo)
         VALUES (?, ?, ?, ?, 1)`,
        [sysId, h.dia_semana, h.hora_inicio, h.hora_fim]
      );
    }

    await conn.commit();

    await registrarAuditoria({
      usuarioId: req.user.sysId,
      usuarioNome: req.user.username,
      tabela: 'sys_usuarios',
      registroId: sysId,
      operacao: 'INSERT',
      valoresNovos: { nome, login, email, perfil_id, status, horarios },
      ip: req.clientIp,
    });

    res.json({ success: true, id: sysId, cd_usrs: nextId });
  } catch (error) {
    await conn.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    conn.release();
  }
});

router.put('/usuarios/:id', requirePermission('admin_usuarios.escrita'), async (req, res) => {
  const conn = await db.getConnection();
  try {
    const { id } = req.params;
    const {
      nome,
      login,
      email,
      senha,
      perfil_id,
      status = 'A',
      hr_matt_entr,
      hr_matt_saida,
      hr_vesp_entr,
      hr_vesp_saida,
      horarios = [],
    } = req.body;

    const [atual] = await conn.query(
      `SELECT su.*, u.nm_usrs, u.nm_logn, u.cd_pass
       FROM sys_usuarios su JOIN knoll_usuarios u ON u.cd_usrs = su.cd_usrs
       WHERE su.id = ?`,
      [id]
    );
    if (!atual[0]) return res.status(404).json({ error: 'Usuário não encontrado' });

    await conn.beginTransaction();

    const senhaFinal = senha ? legacyPlainPassword(senha) : atual[0].cd_pass;
    await conn.query(
      `UPDATE knoll_usuarios SET
        nm_usrs = ?, nm_logn = ?, cd_pass = ?, ds_email = ?,
        hr_matt_entr = ?, hr_matt_saida = ?, hr_vesp_entr = ?, hr_vesp_saida = ?
       WHERE cd_usrs = ?`,
      [
        nome,
        login,
        senhaFinal,
        email || null,
        hr_matt_entr || null,
        hr_matt_saida || null,
        hr_vesp_entr || null,
        hr_vesp_saida || null,
        atual[0].cd_usrs,
      ]
    );

    if (senha) {
      const passHash = await hashPassword(senha);
      await conn.query(
        `UPDATE sys_usuarios SET perfil_id = ?, email = ?, password_hash = ?, status = ? WHERE id = ?`,
        [perfil_id || null, email || null, passHash, status === 'I' ? 'I' : 'A', id]
      );
    } else {
      await conn.query(
        `UPDATE sys_usuarios SET perfil_id = ?, email = ?, status = ? WHERE id = ?`,
        [perfil_id || null, email || null, status === 'I' ? 'I' : 'A', id]
      );
    }

    await conn.query(`DELETE FROM sys_horarios_acesso WHERE usuario_id = ?`, [id]);
    for (const h of horarios) {
      if (!h.ativo) continue;
      await conn.query(
        `INSERT INTO sys_horarios_acesso (usuario_id, dia_semana, hora_inicio, hora_fim, ativo)
         VALUES (?, ?, ?, ?, 1)`,
        [id, h.dia_semana, h.hora_inicio, h.hora_fim]
      );
    }

    await conn.commit();

    const operacao = senha ? 'SENHA' : 'UPDATE';
    await registrarAuditoria({
      usuarioId: req.user.sysId,
      usuarioNome: req.user.username,
      tabela: 'sys_usuarios',
      registroId: id,
      operacao,
      valoresAnteriores: {
        nome: atual[0].nm_usrs,
        login: atual[0].nm_logn,
        perfil_id: atual[0].perfil_id,
        status: atual[0].status,
      },
      valoresNovos: { nome, login, email, perfil_id, status, horarios },
      ip: req.clientIp,
    });

    res.json({ success: true });
  } catch (error) {
    await conn.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    conn.release();
  }
});

router.delete('/usuarios/:id', requirePermission('admin_usuarios.escrita'), async (req, res) => {
  try {
    const { id } = req.params;
    await db.query(
      `UPDATE sys_usuarios SET deleted_at = NOW(), status = 'I' WHERE id = ?`,
      [id]
    );
    await registrarAuditoria({
      usuarioId: req.user.sysId,
      usuarioNome: req.user.username,
      tabela: 'sys_usuarios',
      registroId: id,
      operacao: 'DELETE',
      ip: req.clientIp,
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------- Consulta de Acessos ----------
router.get('/acessos', requirePermission('admin_acessos.consulta'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const { usuario, data_ini, data_fim, ip, status } = req.query;

    const where = [];
    const params = [];

    if (usuario) {
      where.push('(a.login LIKE ? OR a.usuario_id = ?)');
      params.push(`%${usuario}%`, usuario);
    }
    if (data_ini) {
      where.push('DATE(a.data_hora) >= ?');
      params.push(data_ini);
    }
    if (data_fim) {
      where.push('DATE(a.data_hora) <= ?');
      params.push(data_fim);
    }
    if (ip) {
      where.push('a.ip LIKE ?');
      params.push(`%${ip}%`);
    }
    if (status) {
      where.push('a.status = ?');
      params.push(status);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [countRows] = await db.query(
      `SELECT COUNT(*) AS total FROM sys_acessos a ${whereSql}`,
      params
    );
    const total = countRows[0].total;

    const [rows] = await db.query(
      `
      SELECT a.*, u.nm_usrs AS usuario_nome
      FROM sys_acessos a
      LEFT JOIN sys_usuarios su ON su.id = a.usuario_id
      LEFT JOIN knoll_usuarios u ON u.cd_usrs = su.cd_usrs
      ${whereSql}
      ORDER BY a.data_hora DESC
      LIMIT ? OFFSET ?
    `,
      [...params, limit, offset]
    );

    res.json({
      data: rows,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------- Auditoria ----------
router.get('/auditoria', requirePermission('admin_auditoria.consulta'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const { usuario, data_ini, data_fim, tabela, operacao } = req.query;

    const where = [];
    const params = [];

    if (usuario) {
      where.push('(a.usuario_nome LIKE ? OR a.usuario_id = ?)');
      params.push(`%${usuario}%`, usuario);
    }
    if (data_ini) {
      where.push('DATE(a.data_hora) >= ?');
      params.push(data_ini);
    }
    if (data_fim) {
      where.push('DATE(a.data_hora) <= ?');
      params.push(data_fim);
    }
    if (tabela) {
      where.push('a.tabela LIKE ?');
      params.push(`%${tabela}%`);
    }
    if (operacao) {
      where.push('a.operacao = ?');
      params.push(operacao);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [countRows] = await db.query(
      `SELECT COUNT(*) AS total FROM sys_auditoria a ${whereSql}`,
      params
    );
    const total = countRows[0].total;

    const [rows] = await db.query(
      `
      SELECT a.* FROM sys_auditoria a
      ${whereSql}
      ORDER BY a.data_hora DESC
      LIMIT ? OFFSET ?
    `,
      [...params, limit, offset]
    );

    res.json({
      data: rows,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
