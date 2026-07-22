const db = require('../db');

async function registrarAuditoria({
  usuarioId = null,
  usuarioNome = null,
  tabela = null,
  registroId = null,
  operacao,
  valoresAnteriores = null,
  valoresNovos = null,
  ip = null,
}) {
  try {
    await db.query(
      `INSERT INTO sys_auditoria
        (usuario_id, usuario_nome, tabela, registro_id, operacao, valores_anteriores, valores_novos, ip)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        usuarioId,
        usuarioNome,
        tabela,
        registroId != null ? String(registroId) : null,
        operacao,
        valoresAnteriores ? JSON.stringify(valoresAnteriores) : null,
        valoresNovos ? JSON.stringify(valoresNovos) : null,
        ip,
      ]
    );
  } catch (err) {
    console.error('Falha ao registrar auditoria:', err.message);
  }
}

async function registrarAcesso({
  usuarioId = null,
  login = null,
  ip = null,
  navegador = null,
  acao = 'login',
  status = 'sucesso',
  detalhes = null,
}) {
  try {
    await db.query(
      `INSERT INTO sys_acessos (usuario_id, login, ip, navegador, acao, status, detalhes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [usuarioId, login, ip, navegador, acao, status, detalhes]
    );
    await db.query(
      `INSERT INTO sys_logs_login (usuario_id, login_tentativa, ip, navegador, status, mensagem)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [usuarioId, login, ip, navegador, status, detalhes]
    );
  } catch (err) {
    console.error('Falha ao registrar acesso:', err.message);
  }
}

/**
 * Verifica horário de acesso.
 * Prioridade: sys_horarios_acesso; fallback: knoll_usuarios (manhã/vespertino).
 */
async function verificarHorarioAcesso(cdUsrs) {
  const now = new Date();
  const dia = now.getDay(); // 0 Dom .. 6 Sab
  const hora = now.toTimeString().slice(0, 8); // HH:MM:SS

  const [sysUser] = await db.query(
    `SELECT id FROM sys_usuarios WHERE cd_usrs = ? AND deleted_at IS NULL`,
    [cdUsrs]
  );

  if (sysUser[0]) {
    const [horarios] = await db.query(
      `SELECT * FROM sys_horarios_acesso WHERE usuario_id = ? AND ativo = 1`,
      [sysUser[0].id]
    );

    if (horarios.length > 0) {
      const hoje = horarios.find((h) => Number(h.dia_semana) === dia);
      if (!hoje) {
        return { permitido: false, motivo: 'Dia da semana não permitido' };
      }
      const ini = String(hoje.hora_inicio).slice(0, 8);
      const fim = String(hoje.hora_fim).slice(0, 8);
      if (hora < ini || hora > fim) {
        return { permitido: false, motivo: `Fora do horário (${ini} - ${fim})` };
      }
      return { permitido: true };
    }
  }

  // Fallback legado
  const [rows] = await db.query(
    `SELECT hr_matt_entr, hr_matt_saida, hr_vesp_entr, hr_vesp_saida
     FROM knoll_usuarios WHERE cd_usrs = ?`,
    [cdUsrs]
  );
  const u = rows[0];
  if (!u) return { permitido: true };

  const hm = hora.slice(0, 5);
  const manha =
    u.hr_matt_entr &&
    u.hr_matt_saida &&
    hm >= u.hr_matt_entr &&
    hm <= u.hr_matt_saida;
  const tarde =
    u.hr_vesp_entr &&
    u.hr_vesp_saida &&
    hm >= u.hr_vesp_entr &&
    hm <= u.hr_vesp_saida;

  // Se não há horários cadastrados, libera
  if (!u.hr_matt_entr && !u.hr_vesp_entr) return { permitido: true };

  if (manha || tarde) return { permitido: true };
  return {
    permitido: false,
    motivo: `Fora do horário permitido (${u.hr_matt_entr || '--'}-${u.hr_matt_saida || '--'} / ${u.hr_vesp_entr || '--'}-${u.hr_vesp_saida || '--'})`,
  };
}

module.exports = {
  registrarAuditoria,
  registrarAcesso,
  verificarHorarioAcesso,
};
