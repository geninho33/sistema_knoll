const express = require('express');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

router.use(authMiddleware);

function toIsoLocal(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function startOfWeekMonday(ref) {
  const d = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate());
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

// GET /clientes (Search + Pagination)
router.get('/clientes', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const q = req.query.q || '';

    let whereClause = '';
    let params = [];

    if (q) {
      whereClause = 'WHERE NOME LIKE ? OR TELEFONE LIKE ? OR EMAIL LIKE ? OR IDCLI = ?';
      params = [`%${q}%`, `%${q}%`, `%${q}%`, q];
    }

    const [countRows] = await db.query(`SELECT COUNT(*) as total FROM knoll_clientes ${whereClause}`, params);
    const total = countRows[0].total;

    const [rows] = await db.query(`
      SELECT IDCLI, NOME, RAZAO, TELEFONE, CELULAR, FAX, EMAIL,
             CEP, ENDERECO, COMPLEMENTO, BAIRRO, MUNICIPIO, ESTADO, CPF, CGC
      FROM knoll_clientes 
      ${whereClause} 
      ORDER BY IDCLI DESC 
      LIMIT ? OFFSET ?
    `, [...params, limit, offset]);

    res.json({ data: rows, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /clientes/:id
router.get('/clientes/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT IDCLI, NOME, RAZAO, TELEFONE, CELULAR, FAX, EMAIL,
              CEP, ENDERECO, COMPLEMENTO, BAIRRO, MUNICIPIO, ESTADO, CPF, CGC
       FROM knoll_clientes WHERE IDCLI = ?`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Cliente não encontrado' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /clientes/:id/equipamentos
router.get('/clientes/:id/equipamentos', async (req, res) => {
  try {
    const idcli = req.params.id;
    const q = (req.query.q || '').trim();
    const limit = Math.min(parseInt(req.query.limit, 10) || 30, 100);
    let where = 'WHERE IDCLI = ?';
    const params = [idcli];
    if (q) {
      where += ' AND (DS_EQPM LIKE ? OR DS_MODL LIKE ? OR DS_SERI LIKE ? OR NM_MARC LIKE ? OR CD_EQPM = ?)';
      const like = `%${q}%`;
      params.push(like, like, like, like, q);
    }
    const [rows] = await db.query(
      `SELECT CD_EQPM, IDCLI, DS_EQPM, DS_MODL, DS_SERI, NM_SERIE, NM_MARC, NM_REVN, NU_NOTA, DEFEITO, IDSER
       FROM knoll_clientes_produtos
       ${where}
       ORDER BY CD_EQPM DESC
       LIMIT ?`,
      [...params, limit]
    );
    res.json({ data: rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /clientes/:id/equipamentos — cadastro rápido
router.post('/clientes/:id/equipamentos', async (req, res) => {
  try {
    const idcli = Number(req.params.id);
    const { DS_EQPM, DS_MODL, DS_SERI, NM_MARC, NM_REVN, NU_NOTA, DEFEITO, IDSER } = req.body || {};
    if (!DS_EQPM || !String(DS_EQPM).trim()) {
      return res.status(400).json({ error: 'Descrição do equipamento é obrigatória' });
    }
    const [maxRow] = await db.query('SELECT MAX(CD_EQPM) AS maxId FROM knoll_clientes_produtos');
    const nextId = (maxRow[0].maxId || 0) + 1;
    await db.query(
      `INSERT INTO knoll_clientes_produtos
        (IDCLI, CD_EQPM, DS_EQPM, DS_MODL, DS_SERI, NM_MARC, NM_REVN, NU_NOTA, DEFEITO, IDSER)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        idcli, nextId, String(DS_EQPM).trim(), DS_MODL || null, DS_SERI || null,
        NM_MARC || null, NM_REVN || null, NU_NOTA || null, DEFEITO || null, IDSER || null,
      ]
    );
    const [rows] = await db.query(
      `SELECT CD_EQPM, IDCLI, DS_EQPM, DS_MODL, DS_SERI, NM_SERIE, NM_MARC, NM_REVN, NU_NOTA, DEFEITO, IDSER
       FROM knoll_clientes_produtos WHERE CD_EQPM = ?`,
      [nextId]
    );
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /clientes
router.post('/clientes', async (req, res) => {
  try {
    const { NOME, RAZAO, TELEFONE, CELULAR, FAX, EMAIL, CEP, ENDERECO, COMPLEMENTO, BAIRRO, MUNICIPIO, ESTADO, CPF } = req.body;
    const [maxRow] = await db.query('SELECT MAX(IDCLI) as maxId FROM knoll_clientes');
    const nextId = (maxRow[0].maxId || 0) + 1;

    const numCpf = CPF ? CPF.replace(/\D/g, '') : null;
    const numCep = CEP ? CEP.replace(/\D/g, '') : null;

    await db.query(
      `INSERT INTO knoll_clientes (
        IDCLI, NOME, RAZAO, TELEFONE, CELULAR, FAX, EMAIL, CEP, ENDERECO, COMPLEMENTO, BAIRRO, MUNICIPIO, ESTADO, CPF
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nextId, NOME, RAZAO || NOME, TELEFONE, CELULAR, FAX, EMAIL, numCep, ENDERECO, COMPLEMENTO, BAIRRO, MUNICIPIO, ESTADO, numCpf]
    );

    res.json({ success: true, id: nextId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /clientes/:id
router.put('/clientes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { NOME, RAZAO, TELEFONE, CELULAR, FAX, EMAIL, CEP, ENDERECO, COMPLEMENTO, BAIRRO, MUNICIPIO, ESTADO, CPF } = req.body;
    
    const numCpf = CPF ? CPF.replace(/\D/g, '') : null;
    const numCep = CEP ? CEP.replace(/\D/g, '') : null;

    await db.query(
      `UPDATE knoll_clientes SET 
        NOME = ?, RAZAO = ?, TELEFONE = ?, CELULAR = ?, FAX = ?, EMAIL = ?, 
        CEP = ?, ENDERECO = ?, COMPLEMENTO = ?, BAIRRO = ?, MUNICIPIO = ?, ESTADO = ?, CPF = ? 
      WHERE IDCLI = ?`,
      [NOME, RAZAO || NOME, TELEFONE, CELULAR, FAX, EMAIL, numCep, ENDERECO, COMPLEMENTO, BAIRRO, MUNICIPIO, ESTADO, numCpf, id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /ordens (Search + Pagination)
router.get('/ordens', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const q = req.query.q || '';

    let whereClause = '';
    let params = [];

    if (q) {
      whereClause = 'WHERE s.IDSER = ? OR s.DEFEITO LIKE ? OR s.EQUIPAMENTO LIKE ? OR c.NOME LIKE ?';
      params = [q, `%${q}%`, `%${q}%`, `%${q}%`];
    }

    const countSql = `SELECT COUNT(*) as total FROM knoll_servicos s LEFT JOIN knoll_clientes c ON s.IDCLI = c.IDCLI ${whereClause}`;
    const [countRows] = await db.query(countSql, params);
    const total = countRows[0].total;

    const [rows] = await db.query(`
      SELECT s.*, c.NOME as CLIENTE_NOME 
      FROM knoll_servicos s 
      LEFT JOIN knoll_clientes c ON s.IDCLI = c.IDCLI 
      ${whereClause} 
      ORDER BY s.IDSER DESC 
      LIMIT ? OFFSET ?
    `, [...params, limit, offset]);

    res.json({ data: rows, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /ordens
router.post('/ordens', async (req, res) => {
  try {
    const { 
      IDCLI, EQUIPAMENTO, DEFEITO, IN_STATUS, 
      DT_SADA, HR_SADA, HR_SERV, IDFUN, TIPO, 
      VAL_SER, VAL_PRO, VAL_DES, VAL_TOT, SERVICO 
    } = req.body;
    
    const [maxRow] = await db.query('SELECT MAX(IDSER) as maxId FROM knoll_servicos');
    const nextId = (maxRow[0].maxId || 0) + 1;

    const dtSadaVal = DT_SADA ? DT_SADA : null;

    const query = `
      INSERT INTO knoll_servicos (
        IDSER, IDCLI, EQUIPAMENTO, DEFEITO, IN_STATUS, DT_ENTR, 
        DT_SADA, HR_SADA, HR_SERV, IDFUN, TIPO, VAL_SER, VAL_PRO, VAL_DES, VAL_TOT, SERVICO
      ) VALUES (?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await db.query(query, [
      nextId, IDCLI || 0, EQUIPAMENTO || '', DEFEITO || '', IN_STATUS || 'Aberto',
      dtSadaVal, HR_SADA || null, HR_SERV || null, IDFUN || 1, TIPO || null,
      VAL_SER || 0, VAL_PRO || 0, VAL_DES || 0, VAL_TOT || 0, SERVICO || null
    ]);

    res.json({ success: true, id: nextId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /ordens/:id
router.put('/ordens/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      IDCLI, EQUIPAMENTO, DEFEITO, IN_STATUS, 
      DT_SADA, HR_SADA, HR_SERV, IDFUN, TIPO, 
      VAL_SER, VAL_PRO, VAL_DES, VAL_TOT, SERVICO 
    } = req.body;

    const dtSadaVal = DT_SADA ? DT_SADA : null;

    const query = `
      UPDATE knoll_servicos SET 
        IDCLI = ?, EQUIPAMENTO = ?, DEFEITO = ?, IN_STATUS = ?,
        DT_SADA = ?, HR_SADA = ?, HR_SERV = ?, IDFUN = ?, TIPO = ?,
        VAL_SER = ?, VAL_PRO = ?, VAL_DES = ?, VAL_TOT = ?, SERVICO = ?
      WHERE IDSER = ?
    `;

    await db.query(query, [
      IDCLI || 0, EQUIPAMENTO || '', DEFEITO || '', IN_STATUS,
      dtSadaVal, HR_SADA || null, HR_SERV || null, IDFUN || 1, TIPO || null,
      VAL_SER || 0, VAL_PRO || 0, VAL_DES || 0, VAL_TOT || 0, SERVICO || null, id
    ]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /search (Global Search)
router.get('/search', async (req, res) => {
  const query = req.query.q || '';
  if (!query) return res.json({ clientes: [], ordens: [] });

  try {
    const searchTerm = `%${query}%`;
    const [clientes] = await db.query('SELECT IDCLI, NOME, TELEFONE, EMAIL FROM knoll_clientes WHERE NOME LIKE ? OR TELEFONE LIKE ? OR EMAIL LIKE ? LIMIT 10', [searchTerm, searchTerm, searchTerm]);
    const [ordens] = await db.query(`SELECT s.IDSER, s.DEFEITO, s.EQUIPAMENTO, s.IN_STATUS, c.NOME as CLIENTE_NOME FROM knoll_servicos s LEFT JOIN knoll_clientes c ON s.IDCLI = c.IDCLI WHERE s.IDSER LIKE ? OR s.DEFEITO LIKE ? OR s.EQUIPAMENTO LIKE ? OR c.NOME LIKE ? LIMIT 10`, [searchTerm, searchTerm, searchTerm, searchTerm]);
    res.json({ clientes, ordens });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /ordens/:id/itens
router.get('/ordens/:id/itens', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM knoll_servicos_itens WHERE IDSER = ?', [id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /ordens/:id/itens — lança peça/produto na OS
router.post('/ordens/:id/itens', async (req, res) => {
  try {
    const idser = Number(req.params.id);
    const { IDPRO, DESCRICAO, UNIDADE, QTDE, VAL_UNI, PS } = req.body || {};
    if (!IDPRO) return res.status(400).json({ error: 'Produto/peça é obrigatório' });

    let descricao = DESCRICAO;
    let unidade = UNIDADE || 'UN';
    let valUni = Number(VAL_UNI);
    let ps = PS || 'P';

    if (!descricao || Number.isNaN(valUni)) {
      const [prods] = await db.query(
        'SELECT IDPRO, DESCRICAO, UNIDADE, VENDA, PS FROM knoll_produtos WHERE IDPRO = ?',
        [IDPRO]
      );
      if (prods[0]) {
        descricao = descricao || prods[0].DESCRICAO;
        unidade = unidade || prods[0].UNIDADE || 'UN';
        if (Number.isNaN(valUni)) valUni = Number(prods[0].VENDA) || 0;
        ps = ps || prods[0].PS || 'P';
      }
    }

    const qtde = Number(QTDE) || 1;
    const valTot = Number((qtde * (valUni || 0)).toFixed(2));

    await db.query('DELETE FROM knoll_servicos_itens WHERE IDSER = ? AND IDPRO = ?', [idser, IDPRO]);
    await db.query(
      `INSERT INTO knoll_servicos_itens (IDSER, IDPRO, QTDE, VAL_UNI, VAL_TOT, DESCRICAO, UNIDADE, PS)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [idser, IDPRO, qtde, valUni || 0, valTot, descricao || '', unidade, ps]
    );

    const [rows] = await db.query('SELECT * FROM knoll_servicos_itens WHERE IDSER = ?', [idser]);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /ordens/:id/itens/:idpro
router.delete('/ordens/:id/itens/:idpro', async (req, res) => {
  try {
    await db.query('DELETE FROM knoll_servicos_itens WHERE IDSER = ? AND IDPRO = ?', [
      req.params.id,
      req.params.idpro,
    ]);
    const [rows] = await db.query('SELECT * FROM knoll_servicos_itens WHERE IDSER = ?', [req.params.id]);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /tecnicos
router.get('/tecnicos', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
    let where = `WHERE NOME IS NOT NULL AND TRIM(NOME) <> ''`;
    const params = [];
    if (q) {
      where += ' AND (NOME LIKE ? OR IDFUN = ? OR FONE LIKE ? OR CELULAR LIKE ?)';
      const like = `%${q}%`;
      params.push(like, q, like, like);
    }
    const [rows] = await db.query(
      `SELECT IDFUN, NOME, FONE, CELULAR, MUNICIPIO, TIPO
       FROM knoll_funcionario
       ${where}
       ORDER BY NOME
       LIMIT ?`,
      [...params, limit]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /tecnicos — cadastro rápido
router.post('/tecnicos', async (req, res) => {
  try {
    const { NOME, FONE, CELULAR, MUNICIPIO } = req.body || {};
    if (!NOME || !String(NOME).trim()) {
      return res.status(400).json({ error: 'Nome do técnico é obrigatório' });
    }
    const [maxRow] = await db.query('SELECT MAX(IDFUN) AS maxId FROM knoll_funcionario');
    const nextId = (maxRow[0].maxId || 0) + 1;
    await db.query(
      `INSERT INTO knoll_funcionario (IDFUN, NOME, FONE, CELULAR, MUNICIPIO)
       VALUES (?, ?, ?, ?, ?)`,
      [nextId, String(NOME).trim(), FONE || null, CELULAR || null, MUNICIPIO || null]
    );
    const [rows] = await db.query(
      `SELECT IDFUN, NOME, FONE, CELULAR, MUNICIPIO, TIPO FROM knoll_funcionario WHERE IDFUN = ?`,
      [nextId]
    );
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /produtos?q=&tipo=all|peca|produto
router.get('/produtos', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    const tipo = String(req.query.tipo || 'all').toLowerCase();
    const limit = Math.min(parseInt(req.query.limit, 10) || 25, 100);
    const where = [];
    const params = [];

    if (tipo === 'peca') {
      where.push(`UPPER(COALESCE(PS,'')) = 'P'`);
    } else if (tipo === 'produto') {
      where.push(`(PS IS NULL OR UPPER(PS) <> 'P')`);
    }

    if (q) {
      where.push('(DESCRICAO LIKE ? OR IDPRO = ? OR MODELO LIKE ? OR BARRAS LIKE ?)');
      const like = `%${q}%`;
      params.push(like, q, like, like);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [rows] = await db.query(
      `SELECT IDPRO, DESCRICAO, UNIDADE, VENDA, CUSTO, ATUAL, PS, MODELO, DS_MARCA, GRUPO
       FROM knoll_produtos
       ${whereSql}
       ORDER BY DESCRICAO
       LIMIT ?`,
      [...params, limit]
    );
    res.json({ data: rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /produtos — cadastro rápido
router.post('/produtos', async (req, res) => {
  try {
    const { DESCRICAO, UNIDADE, VENDA, PS, MODELO } = req.body || {};
    if (!DESCRICAO || !String(DESCRICAO).trim()) {
      return res.status(400).json({ error: 'Descrição é obrigatória' });
    }
    const [maxRow] = await db.query('SELECT MAX(IDPRO) AS maxId FROM knoll_produtos');
    const nextId = (maxRow[0].maxId || 0) + 1;
    const ps = PS || 'S';
    const venda = Number(VENDA) || 0;
    await db.query(
      `INSERT INTO knoll_produtos (IDPRO, DESCRICAO, UNIDADE, VENDA, PS, MODELO)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nextId, String(DESCRICAO).trim(), UNIDADE || 'UN', venda, ps, MODELO || null]
    );
    const [rows] = await db.query(
      `SELECT IDPRO, DESCRICAO, UNIDADE, VENDA, CUSTO, ATUAL, PS, MODELO, DS_MARCA, GRUPO
       FROM knoll_produtos WHERE IDPRO = ?`,
      [nextId]
    );
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /dashboard/kpis
router.get('/dashboard/kpis', async (req, res) => {
  try {
    const todayDate = new Date();
    const today = toIsoLocal(todayDate);
    const monthStart = `${today.slice(0, 7)}-01`;

    const [[osAbertas]] = await db.query(
      `SELECT COUNT(*) AS total FROM knoll_servicos
       WHERE IN_STATUS IS NULL
          OR TRIM(IN_STATUS) = ''
          OR IN_STATUS IN ('Aberto', 'Aguardando Atendimento')`
    );
    const [[osAndamento]] = await db.query(
      `SELECT COUNT(*) AS total FROM knoll_servicos
       WHERE IN_STATUS IN ('Em atendimento', 'Aguardando Peça')`
    );
    const [[osConcluidas]] = await db.query(
      `SELECT COUNT(*) AS total FROM knoll_servicos
       WHERE IN_STATUS IN ('Encerrado', 'Concluído')
         AND (
           (DT_SADA IS NOT NULL AND DT_SADA NOT LIKE '0000%' AND DATE(DT_SADA) >= ? AND DATE(DT_SADA) <= ?)
           OR ((DT_SADA IS NULL OR DT_SADA LIKE '0000%') AND DATE(DT_ENTR) >= ? AND DATE(DT_ENTR) <= ?)
         )`,
      [monthStart, today, monthStart, today]
    );
    const [[faturamento]] = await db.query(
      `SELECT COALESCE(SUM(
          CASE
            WHEN VAL_TOT IS NULL OR VAL_TOT = 0 THEN COALESCE(VAL_SER,0) + COALESCE(VAL_PRO,0) - COALESCE(VAL_DES,0)
            ELSE VAL_TOT
          END
        ), 0) AS total
       FROM knoll_servicos
       WHERE (IN_STATUS IS NULL OR IN_STATUS NOT IN ('Cancelado'))
         AND DATE(DT_ENTR) >= ? AND DATE(DT_ENTR) <= ?`,
      [monthStart, today]
    );
    const [[clientes]] = await db.query(`SELECT COUNT(*) AS total FROM knoll_clientes`);
    const [[agendaHoje]] = await db.query(
      `SELECT COUNT(*) AS total FROM knoll_servicos
       WHERE DATE(DT_SADA) = ?
         AND (IN_STATUS IS NULL OR IN_STATUS NOT IN ('Cancelado'))`,
      [today]
    );

    res.json({
      os_abertas: Number(osAbertas.total) || 0,
      os_andamento: Number(osAndamento.total) || 0,
      os_concluidas: Number(osConcluidas.total) || 0,
      faturamento_mes: Number(faturamento.total) || 0,
      clientes: Number(clientes.total) || 0,
      agenda_hoje: Number(agendaHoje.total) || 0,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /dashboard/overview — gráficos + agenda semanal
router.get('/dashboard/overview', async (req, res) => {
  try {
    const today = new Date();

    // Volume últimos 12 meses (por mês de abertura)
    const [volumeRows] = await db.query(
      `SELECT DATE_FORMAT(DT_ENTR, '%Y-%m') AS periodo, COUNT(*) AS total
       FROM knoll_servicos
       WHERE DT_ENTR IS NOT NULL
         AND CAST(DT_ENTR AS CHAR) NOT LIKE '0000%'
         AND DT_ENTR >= DATE_SUB(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 11 MONTH)
         AND (IN_STATUS IS NULL OR IN_STATUS NOT IN ('Cancelado'))
       GROUP BY DATE_FORMAT(DT_ENTR, '%Y-%m')
       ORDER BY periodo ASC`
    );

    // Ranking técnicos (90 dias)
    const [tecnicos] = await db.query(
      `SELECT COALESCE(f.IDFUN, s.IDFUN) AS IDFUN,
              COALESCE(NULLIF(TRIM(f.NOME), ''), CONCAT('Tecnico #', s.IDFUN)) AS NOME,
              COUNT(*) AS total
       FROM knoll_servicos s
       LEFT JOIN knoll_funcionario f ON f.IDFUN = s.IDFUN
       WHERE s.IDFUN IS NOT NULL AND s.IDFUN <> 0
         AND s.DT_ENTR IS NOT NULL
         AND CAST(s.DT_ENTR AS CHAR) NOT LIKE '0000%'
         AND s.DT_ENTR >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)
         AND (s.IN_STATUS IS NULL OR s.IN_STATUS NOT IN ('Cancelado'))
       GROUP BY COALESCE(f.IDFUN, s.IDFUN), COALESCE(NULLIF(TRIM(f.NOME), ''), CONCAT('Tecnico #', s.IDFUN))
       ORDER BY total DESC
       LIMIT 8`
    );

    // Ranking regiões / municípios
    const [regioes] = await db.query(
      `SELECT COALESCE(NULLIF(TRIM(c.MUNICIPIO), ''), 'Sem municipio') AS MUNICIPIO,
              COALESCE(NULLIF(TRIM(c.ESTADO), ''), '') AS ESTADO,
              COUNT(*) AS total
       FROM knoll_servicos s
       LEFT JOIN knoll_clientes c ON c.IDCLI = s.IDCLI
       WHERE s.DT_ENTR IS NOT NULL
         AND CAST(s.DT_ENTR AS CHAR) NOT LIKE '0000%'
         AND s.DT_ENTR >= DATE_SUB(CURDATE(), INTERVAL 180 DAY)
         AND (s.IN_STATUS IS NULL OR s.IN_STATUS NOT IN ('Cancelado'))
       GROUP BY COALESCE(NULLIF(TRIM(c.MUNICIPIO), ''), 'Sem municipio'),
                COALESCE(NULLIF(TRIM(c.ESTADO), ''), '')
       ORDER BY total DESC
       LIMIT 10`
    );

    // Semana (segunda a domingo) — week_start=YYYY-MM-DD opcional
    let monday;
    if (req.query.week_start) {
      const parts = String(req.query.week_start).slice(0, 10).split('-').map(Number);
      if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
        monday = startOfWeekMonday(new Date(parts[0], parts[1] - 1, parts[2]));
      }
    }
    if (!monday) {
      monday = startOfWeekMonday(today);
    }
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const weekStart = toIsoLocal(monday);
    const weekEnd = toIsoLocal(sunday);
    const todayStr = toIsoLocal(today);

    const [agenda] = await db.query(
      `SELECT s.IDSER, s.IDCLI, s.IDFUN, s.IN_STATUS, s.EQUIPAMENTO, s.DEFEITO,
              s.DT_SADA, s.HR_SADA, s.HR_SERV,
              c.NOME AS CLIENTE_NOME, c.MUNICIPIO,
              f.NOME AS TECNICO_NOME
       FROM knoll_servicos s
       LEFT JOIN knoll_clientes c ON c.IDCLI = s.IDCLI
       LEFT JOIN knoll_funcionario f ON f.IDFUN = s.IDFUN
       WHERE s.DT_SADA IS NOT NULL
         AND CAST(s.DT_SADA AS CHAR) NOT LIKE '0000%'
         AND s.DT_SADA >= ?
         AND s.DT_SADA < DATE_ADD(?, INTERVAL 1 DAY)
         AND (s.IN_STATUS IS NULL OR s.IN_STATUS NOT IN ('Cancelado'))
       ORDER BY s.DT_SADA ASC, s.HR_SADA ASC, s.IDSER ASC`,
      [weekStart, weekEnd]
    );

    // Completar meses faltantes no volume
    const volumeMap = Object.fromEntries(volumeRows.map((r) => [r.periodo, Number(r.total) || 0]));
    const volume = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      volume.push({ periodo: key, total: volumeMap[key] || 0 });
    }

    res.json({
      volume,
      tecnicos: tecnicos.map((t) => ({
        id: t.IDFUN,
        nome: String(t.NOME || '').replace(/^Tecnico #/, 'Técnico #'),
        total: Number(t.total) || 0,
      })),
      regioes: regioes.map((r) => ({
        municipio: r.MUNICIPIO === 'Sem municipio' ? 'Não informado' : r.MUNICIPIO,
        estado: r.ESTADO,
        total: Number(r.total) || 0,
      })),
      semana: {
        inicio: weekStart,
        fim: weekEnd,
        hoje: todayStr,
        itens: agenda,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
