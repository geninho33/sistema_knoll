const express = require('express');
const db = require('../db');
const router = express.Router();

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
      SELECT IDCLI, NOME, RAZAO, TELEFONE, CELULAR, EMAIL 
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

module.exports = router;
