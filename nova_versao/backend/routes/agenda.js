const express = require('express');
const path = require('path');
const db = require('../db');

const router = express.Router();

function mapEmpresaLogo(row) {
  if (!row) return null;
  if (row.ds_logo) {
    row.logo_url = `/uploads/empresa/${path.basename(row.ds_logo)}`;
  }
  return row;
}

/** Recalcula totais a partir dos itens (evita VAL_* corrompidos pelo FORMAT do legado). */
function calcTotaisOS(os, itens = []) {
  const num = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };
  const round = (v) => Math.round((num(v) + Number.EPSILON) * 100) / 100;

  let valSer = 0;
  let valPro = 0;
  for (const item of itens) {
    const tot = round(item.VAL_TOT != null ? item.VAL_TOT : num(item.QTDE) * num(item.VAL_UNI));
    const ps = String(item.PS || '').trim().toUpperCase();
    if (ps === 'S') valSer += tot;
    else valPro += tot;
  }
  valSer = round(valSer);
  valPro = round(valPro);

  let valDes = round(os?.VAL_DES);
  const somaItens = round(valSer + valPro);
  if (somaItens > 0 && valDes > somaItens) {
    const maybe = round(valDes / 100);
    valDes = maybe <= somaItens ? maybe : 0;
  }

  if (itens.length > 0) {
    return {
      VAL_SER: valSer,
      VAL_PRO: valPro,
      VAL_DES: valDes,
      VAL_TOT: round(valSer + valPro - valDes),
    };
  }

  return {
    VAL_SER: round(os?.VAL_SER),
    VAL_PRO: round(os?.VAL_PRO),
    VAL_DES: valDes,
    VAL_TOT: round(os?.VAL_TOT || num(os?.VAL_SER) + num(os?.VAL_PRO) - valDes),
  };
}

function parseDateOnly(value) {
  if (!value) return null;
  return String(value).slice(0, 10);
}

function buildPeriodFilter(view, dateRef, alias = 's') {
  const date = parseDateOnly(dateRef) || new Date().toISOString().slice(0, 10);
  const [y, m] = date.split('-').map(Number);

  if (view === 'ano') {
    return {
      sql: `YEAR(${alias}.DT_SADA) = ?`,
      params: [y],
      label: String(y),
    };
  }

  if (view === 'mes') {
    return {
      sql: `YEAR(${alias}.DT_SADA) = ? AND MONTH(${alias}.DT_SADA) = ?`,
      params: [y, m],
      label: `${String(m).padStart(2, '0')}/${y}`,
    };
  }

  return {
    sql: `DATE(${alias}.DT_SADA) = ?`,
    params: [date],
    label: date,
  };
}

const OS_SELECT = `
  SELECT
    s.IDSER, s.IDCLI, s.IDFUN, s.DT_ENTR, s.DT_SADA, s.HR_SADA, s.HR_SERV,
    s.IN_STATUS, s.TIPO, s.EQUIPAMENTO, s.DEFEITO, s.SERVICO,
    s.VAL_SER, s.VAL_PRO, s.VAL_DES, s.VAL_TOT,
    c.NOME AS CLIENTE_NOME, c.TELEFONE, c.CELULAR,
    c.ENDERECO, c.BAIRRO, c.MUNICIPIO, c.ESTADO, c.CEP, c.COMPLEMENTO,
    f.NOME AS TECNICO_NOME,
    (
      SELECT GROUP_CONCAT(NULLIF(TRIM(p.DS_EQPM), '') ORDER BY p.CD_EQPM SEPARATOR ', ')
      FROM knoll_clientes_produtos p
      WHERE p.IDSER = s.IDSER
    ) AS EQUIPAMENTO_NOME,
    (
      SELECT GROUP_CONCAT(NULLIF(TRIM(p.DEFEITO), '') ORDER BY p.CD_EQPM SEPARATOR ' | ')
      FROM knoll_clientes_produtos p
      WHERE p.IDSER = s.IDSER
    ) AS EQUIPAMENTO_DEFEITO
  FROM knoll_servicos s
  LEFT JOIN knoll_clientes c ON c.IDCLI = s.IDCLI
  LEFT JOIN knoll_funcionario f ON f.IDFUN = s.IDFUN
`;

function formatEquipamentoLinha(eq) {
  const parts = [
    eq.DS_EQPM,
    eq.NM_MARC ? `Marca: ${eq.NM_MARC}` : null,
    eq.DS_MODL ? `Modelo: ${eq.DS_MODL}` : null,
    eq.DS_SERI ? `Série: ${eq.DS_SERI}` : null,
    eq.NM_SERIE ? `Nº Série: ${eq.NM_SERIE}` : null,
  ].filter(Boolean);
  return parts.join(' · ') || null;
}

// GET /api/agenda/tecnicos
router.get('/tecnicos', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT IDFUN, NOME, FONE, CELULAR, MUNICIPIO, TIPO
      FROM knoll_funcionario
      WHERE NOME IS NOT NULL AND TRIM(NOME) <> ''
      ORDER BY NOME
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/agenda/pendentes
router.get('/pendentes', async (req, res) => {
  try {
    const [rows] = await db.query(`
      ${OS_SELECT}
      WHERE (s.IDFUN IS NULL OR s.IDFUN = 0)
        AND (s.IN_STATUS IS NULL OR s.IN_STATUS NOT IN ('Encerrado', 'Cancelado'))
      ORDER BY
        CASE WHEN s.DT_SADA IS NULL OR s.DT_SADA LIKE '0000%' THEN 1 ELSE 0 END,
        s.DT_SADA ASC, s.HR_SADA ASC, s.IDSER DESC
      LIMIT 200
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/agenda/tecnico/:id?view=dia|mes|ano&data=YYYY-MM-DD
router.get('/tecnico/:id', async (req, res) => {
  try {
    const idFun = Number(req.params.id);
    const view = req.query.view || 'dia';
    const period = buildPeriodFilter(view, req.query.data);

    const [rows] = await db.query(
      `
      ${OS_SELECT}
      WHERE s.IDFUN = ?
        AND s.DT_SADA IS NOT NULL
        AND s.DT_SADA NOT LIKE '0000%'
        AND ${period.sql}
      ORDER BY s.DT_SADA ASC, s.HR_SADA ASC, s.IDSER ASC
    `,
      [idFun, ...period.params]
    );

    const [tecnico] = await db.query(
      `SELECT IDFUN, NOME, FONE, CELULAR FROM knoll_funcionario WHERE IDFUN = ?`,
      [idFun]
    );

    res.json({
      tecnico: tecnico[0] || null,
      view,
      periodo: period.label,
      data: rows,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/agenda/servicos?view=dia|mes|ano&data=YYYY-MM-DD
router.get('/servicos', async (req, res) => {
  try {
    const view = req.query.view || 'dia';
    const period = buildPeriodFilter(view, req.query.data);

    const [rows] = await db.query(
      `
      ${OS_SELECT}
      WHERE s.DT_SADA IS NOT NULL
        AND s.DT_SADA NOT LIKE '0000%'
        AND ${period.sql}
      ORDER BY s.DT_SADA ASC, s.HR_SADA ASC, s.IDSER ASC
    `,
      period.params
    );

    res.json({
      view,
      periodo: period.label,
      data: rows,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/agenda/meu-dia?data=YYYY-MM-DD&idfun=
router.get('/meu-dia', async (req, res) => {
  try {
    const date = parseDateOnly(req.query.data) || new Date().toISOString().slice(0, 10);
    let idFun = req.query.idfun ? Number(req.query.idfun) : null;

    // Fallback: tenta mapear usuário logado por nome em knoll_funcionario
    if (!idFun && req.query.usuario) {
      const [match] = await db.query(
        `SELECT IDFUN FROM knoll_funcionario WHERE NOME LIKE ? LIMIT 1`,
        [`%${req.query.usuario}%`]
      );
      idFun = match[0]?.IDFUN || null;
    }

    if (!idFun) {
      return res.status(400).json({ error: 'Técnico não identificado. Informe idfun.' });
    }

    const [rows] = await db.query(
      `
      ${OS_SELECT}
      WHERE s.IDFUN = ?
        AND DATE(s.DT_SADA) = ?
      ORDER BY s.HR_SADA ASC, s.IDSER ASC
    `,
      [idFun, date]
    );

    const roteiro = rows.map((item, index) => ({
      ordem: index + 1,
      idser: item.IDSER,
      cliente: item.CLIENTE_NOME,
      horario: item.HR_SADA,
      endereco: [item.ENDERECO, item.BAIRRO, item.MUNICIPIO, item.ESTADO]
        .filter(Boolean)
        .join(', '),
      telefone: item.CELULAR || item.TELEFONE,
      status: item.IN_STATUS,
      lat: null,
      lng: null,
      mapsQuery: [item.ENDERECO, item.BAIRRO, item.MUNICIPIO, item.ESTADO, item.CEP]
        .filter(Boolean)
        .join(', '),
    }));

    res.json({ data: date, idfun: idFun, atendimentos: rows, roteiro });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/agenda/atribuir/:idser  { IDFUN, DT_SADA?, HR_SADA? }
router.put('/atribuir/:idser', async (req, res) => {
  try {
    const idser = Number(req.params.idser);
    const { IDFUN, DT_SADA, HR_SADA } = req.body || {};

    if (!IDFUN) {
      return res.status(400).json({ error: 'IDFUN é obrigatório' });
    }

    const fields = ['IDFUN = ?'];
    const params = [IDFUN];

    if (DT_SADA) {
      fields.push('DT_SADA = ?');
      params.push(DT_SADA);
    }
    if (HR_SADA !== undefined) {
      fields.push('HR_SADA = ?');
      params.push(HR_SADA || null);
    }

    params.push(idser);
    await db.query(`UPDATE knoll_servicos SET ${fields.join(', ')} WHERE IDSER = ?`, params);

    const [rows] = await db.query(`${OS_SELECT} WHERE s.IDSER = ?`, [idser]);
    res.json({ success: true, data: rows[0] || null });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/agenda/empresa (dados para impressão)
router.get('/empresa', async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT * FROM knoll_configuracao LIMIT 1`);
    const row = rows[0] || { nm_empr: 'MARLON KNOLL', ds_razao: 'Assistência Técnica' };
    res.json(mapEmpresaLogo(row));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/agenda/os/:id (detalhe completo para impressão)
router.get('/os/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [rows] = await db.query(`${OS_SELECT} WHERE s.IDSER = ?`, [id]);
    if (!rows[0]) return res.status(404).json({ error: 'OS não encontrada' });

    const [itens] = await db.query(
      `SELECT IDPRO, DESCRICAO, QTDE, VAL_UNI, VAL_TOT, UNIDADE, PS
       FROM knoll_servicos_itens WHERE IDSER = ?`,
      [id]
    );
    const [equipamentos] = await db.query(
      `SELECT CD_EQPM, DS_EQPM, NM_MARC, DS_MODL, DS_SERI, NM_SERIE,
              NU_NOTA, NM_REVN, DT_EMSS, DEFEITO, DS_OBSR
       FROM knoll_clientes_produtos
       WHERE IDSER = ?
       ORDER BY CD_EQPM`,
      [id]
    );
    const [empresa] = await db.query(`SELECT * FROM knoll_configuracao LIMIT 1`);
    const totais = calcTotaisOS(rows[0], itens);
    const os = { ...rows[0], ...totais };

    // Fallback: defeito do equipamento quando o cabeçalho da OS estiver vazio
    if (!os.DEFEITO && os.EQUIPAMENTO_DEFEITO) {
      os.DEFEITO = os.EQUIPAMENTO_DEFEITO;
    }
    if (!os.EQUIPAMENTO_NOME && equipamentos.length) {
      os.EQUIPAMENTO_NOME = equipamentos.map(formatEquipamentoLinha).filter(Boolean).join('; ');
    }

    res.json({
      os,
      itens,
      equipamentos,
      totais,
      empresa: mapEmpresaLogo(empresa[0] || null),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
