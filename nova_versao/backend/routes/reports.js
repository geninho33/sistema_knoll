const express = require('express');
const db = require('../db');
const { authMiddleware, requirePermission } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

async function getEmpresa() {
  const [rows] = await db.query(`SELECT * FROM knoll_configuracao LIMIT 1`);
  return rows[0] || { nm_empr: 'MARLON KNOLL', ds_razao: 'Assistência Técnica' };
}

function paginate(query) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(500, Math.max(1, parseInt(query.limit) || 50));
  return { page, limit, offset: (page - 1) * limit };
}

function meta(req, empresa, total, page, totalPages, tipo, titulo) {
  return {
    empresa: empresa.nm_empr || empresa.ds_razao || 'MARLON KNOLL',
    empresa_razao: empresa.ds_razao || null,
    titulo,
    tipo,
    emitido_em: new Date().toISOString(),
    usuario: req.user?.username || req.user?.name || 'sistema',
    total,
    page,
    totalPages,
  };
}

// ---------- Helpers filtros produtos/peças ----------
function buildProdutoFilters(query, { pecas = false } = {}) {
  const where = [];
  const params = [];

  if (pecas) {
    where.push(`p.PS = 'P'`);
  } else {
    where.push(`(p.PS IS NULL OR p.PS <> 'P')`);
  }

  if (query.codigo) {
    where.push('p.IDPRO = ?');
    params.push(query.codigo);
  }
  if (query.descricao) {
    where.push('p.DESCRICAO LIKE ?');
    params.push(`%${query.descricao}%`);
  }
  if (query.categoria) {
    where.push('(p.GRUPO = ? OR p.DS_LINHA LIKE ?)');
    params.push(query.categoria, `%${query.categoria}%`);
  }
  if (query.fornecedor) {
    where.push('(p.DS_FABR LIKE ? OR p.DS_MARCA LIKE ?)');
    params.push(`%${query.fornecedor}%`, `%${query.fornecedor}%`);
  }
  if (query.estoque_min != null && query.estoque_min !== '') {
    where.push('IFNULL(p.ATUAL, 0) >= ?');
    params.push(Number(query.estoque_min));
  }
  if (query.estoque_max != null && query.estoque_max !== '') {
    where.push('IFNULL(p.ATUAL, 0) <= ?');
    params.push(Number(query.estoque_max));
  }
  if (query.situacao === 'ativo') {
    where.push("(p.ST IS NULL OR p.ST = '' OR p.ST = 'A')");
  } else if (query.situacao === 'inativo') {
    where.push("p.ST = 'I'");
  }

  const orderMap = {
    codigo: 'p.IDPRO',
    descricao: 'p.DESCRICAO',
  };
  const orderBy = orderMap[query.ordenacao] || 'p.IDPRO';
  const orderDir = query.ordem === 'desc' ? 'DESC' : 'ASC';

  return {
    whereSql: where.length ? `WHERE ${where.join(' AND ')}` : '',
    params,
    orderSql: `ORDER BY ${orderBy} ${orderDir}`,
  };
}

// ---------- Relatório Clientes ----------
router.get(
  '/clientes',
  requirePermission('rel_clientes.consulta'),
  async (req, res) => {
    try {
      const empresa = await getEmpresa();
      const { page, limit, offset } = paginate(req.query);
      const tipo = req.query.tipo === 'detalhado' ? 'detalhado' : 'sintetico';

      const where = [];
      const params = [];

      if (req.query.nome) {
        where.push('(c.NOME LIKE ? OR c.RAZAO LIKE ?)');
        params.push(`%${req.query.nome}%`, `%${req.query.nome}%`);
      }
      if (req.query.codigo) {
        where.push('c.IDCLI = ?');
        params.push(req.query.codigo);
      }
      if (req.query.bairro) {
        where.push('c.BAIRRO LIKE ?');
        params.push(`%${req.query.bairro}%`);
      }
      if (req.query.municipio) {
        where.push('c.MUNICIPIO LIKE ?');
        params.push(`%${req.query.municipio}%`);
      }
      if (req.query.telefone) {
        where.push('(c.TELEFONE LIKE ? OR c.CELULAR LIKE ? OR c.FAX LIKE ?)');
        params.push(
          `%${req.query.telefone}%`,
          `%${req.query.telefone}%`,
          `%${req.query.telefone}%`
        );
      }

      const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
      const orderBy =
        req.query.ordenacao === 'nome' ? 'c.NOME' : 'c.IDCLI';
      const orderDir = req.query.ordem === 'desc' ? 'DESC' : 'ASC';

      const [countRows] = await db.query(
        `SELECT COUNT(*) AS total FROM knoll_clientes c ${whereSql}`,
        params
      );
      const total = countRows[0].total;
      const totalPages = Math.ceil(total / limit) || 1;

      const fields =
        tipo === 'detalhado'
          ? `c.IDCLI, c.NOME, c.RAZAO, c.CPF, c.CGC, c.TELEFONE, c.CELULAR, c.FAX, c.EMAIL,
             c.CEP, c.ENDERECO, c.COMPLEMENTO, c.BAIRRO, c.MUNICIPIO, c.ESTADO, c.DATA_REG`
          : `c.IDCLI, c.NOME, c.TELEFONE, c.CELULAR, c.BAIRRO, c.MUNICIPIO, c.EMAIL`;

      const exportAll = req.query.export === '1';
      const limitSql = exportAll ? '' : 'LIMIT ? OFFSET ?';
      const queryParams = exportAll ? params : [...params, limit, offset];

      const [rows] = await db.query(
        `SELECT ${fields} FROM knoll_clientes c ${whereSql} ORDER BY ${orderBy} ${orderDir} ${limitSql}`,
        queryParams
      );

      res.json({
        meta: meta(req, empresa, total, page, totalPages, tipo, 'Relatório de Clientes'),
        data: rows,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// ---------- Relatório Serviços ----------
router.get(
  '/servicos',
  requirePermission('rel_servicos.consulta'),
  async (req, res) => {
    try {
      const empresa = await getEmpresa();
      const { page, limit, offset } = paginate(req.query);
      const tipo = req.query.tipo === 'detalhado' ? 'detalhado' : 'sintetico';

      const where = [];
      const params = [];

      if (req.query.data_ini) {
        where.push('DATE(s.DT_ENTR) >= ?');
        params.push(req.query.data_ini);
      }
      if (req.query.data_fim) {
        where.push('DATE(s.DT_ENTR) <= ?');
        params.push(req.query.data_fim);
      }
      if (req.query.cliente) {
        where.push('(c.NOME LIKE ? OR s.IDCLI = ?)');
        params.push(`%${req.query.cliente}%`, req.query.cliente);
      }
      if (req.query.peca) {
        where.push(`EXISTS (
          SELECT 1 FROM knoll_servicos_itens i
          WHERE i.IDSER = s.IDSER AND (i.DESCRICAO LIKE ? OR i.IDPRO = ?)
        )`);
        params.push(`%${req.query.peca}%`, req.query.peca);
      }
      if (req.query.bairro) {
        where.push('c.BAIRRO LIKE ?');
        params.push(`%${req.query.bairro}%`);
      }
      if (req.query.municipio) {
        where.push('c.MUNICIPIO LIKE ?');
        params.push(`%${req.query.municipio}%`);
      }
      if (req.query.tecnico) {
        where.push('(f.NOME LIKE ? OR s.IDFUN = ?)');
        params.push(`%${req.query.tecnico}%`, req.query.tecnico);
      }
      if (req.query.status) {
        where.push('s.IN_STATUS = ?');
        params.push(req.query.status);
      }
      if (req.query.situacao) {
        where.push('s.TIPO = ?');
        params.push(req.query.situacao);
      }

      const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

      const orderMap = {
        codigo: 's.IDSER',
        cliente: 'c.NOME',
        data: 's.DT_ENTR',
        tecnico: 'f.NOME',
      };
      const orderBy = orderMap[req.query.ordenacao] || 's.IDSER';
      const orderDir = req.query.ordem === 'desc' ? 'DESC' : 'ASC';

      const fromSql = `
        FROM knoll_servicos s
        LEFT JOIN knoll_clientes c ON c.IDCLI = s.IDCLI
        LEFT JOIN knoll_funcionario f ON f.IDFUN = s.IDFUN
      `;

      const [countRows] = await db.query(
        `SELECT COUNT(*) AS total ${fromSql} ${whereSql}`,
        params
      );
      const total = countRows[0].total;
      const totalPages = Math.ceil(total / limit) || 1;

      const exportAll = req.query.export === '1';
      const limitSql = exportAll ? '' : 'LIMIT ? OFFSET ?';
      const queryParams = exportAll ? params : [...params, limit, offset];

      const [rows] = await db.query(
        `
        SELECT s.IDSER, s.IDCLI, s.DT_ENTR, s.DT_SADA, s.IN_STATUS, s.TIPO,
               s.EQUIPAMENTO, s.DEFEITO, s.SERVICO, s.VAL_SER, s.VAL_PRO, s.VAL_DES, s.VAL_TOT,
               s.IDFUN, c.NOME AS CLIENTE_NOME, c.ENDERECO, c.BAIRRO, c.MUNICIPIO, c.TELEFONE,
               f.NOME AS TECNICO_NOME
        ${fromSql}
        ${whereSql}
        ORDER BY ${orderBy} ${orderDir}
        ${limitSql}
      `,
        queryParams
      );

      let data = rows;
      if (tipo === 'detalhado' && rows.length > 0) {
        const ids = rows.map((r) => r.IDSER);
        const [itens] = await db.query(
          `SELECT IDSER, IDPRO, DESCRICAO, QTDE, VAL_UNI, VAL_TOT, UNIDADE
           FROM knoll_servicos_itens WHERE IDSER IN (?)`,
          [ids]
        );
        const byOs = {};
        itens.forEach((i) => {
          if (!byOs[i.IDSER]) byOs[i.IDSER] = [];
          byOs[i.IDSER].push(i);
        });
        data = rows.map((r) => ({
          ...r,
          pecas: byOs[r.IDSER] || [],
        }));
      }

      // filtros auxiliares
      const [statusList] = await db.query(
        `SELECT DISTINCT IN_STATUS AS valor FROM knoll_servicos WHERE IN_STATUS IS NOT NULL AND IN_STATUS <> '' ORDER BY IN_STATUS`
      );
      const [tipos] = await db.query(
        `SELECT DISTINCT TIPO AS valor FROM knoll_servicos WHERE TIPO IS NOT NULL AND TIPO <> '' ORDER BY TIPO`
      );
      const [tecnicos] = await db.query(
        `SELECT IDFUN, NOME FROM knoll_funcionario ORDER BY NOME LIMIT 200`
      );

      res.json({
        meta: meta(req, empresa, total, page, totalPages, tipo, 'Relatório de Serviços'),
        data,
        filtros_opcoes: {
          status: statusList.map((s) => s.valor),
          situacoes: tipos.map((t) => t.valor),
          tecnicos,
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// ---------- Relatório Peças ----------
router.get('/pecas', requirePermission('rel_pecas.consulta'), async (req, res) => {
  try {
    const empresa = await getEmpresa();
    const { page, limit, offset } = paginate(req.query);
    const tipo = req.query.tipo === 'detalhado' ? 'detalhado' : 'sintetico';
    const { whereSql, params, orderSql } = buildProdutoFilters(req.query, { pecas: true });

    const [countRows] = await db.query(
      `SELECT COUNT(*) AS total FROM knoll_produtos p ${whereSql}`,
      params
    );
    const total = countRows[0].total;
    const totalPages = Math.ceil(total / limit) || 1;

    const fields =
      tipo === 'detalhado'
        ? `p.IDPRO, p.DESCRICAO, p.MODELO, p.UNIDADE, p.CUSTO, p.VENDA, p.MARGEM,
           p.MINIMO, p.MAXIMO, p.ATUAL, p.DS_FABR, p.DS_MARCA, p.DS_LINHA, p.GRUPO, p.OBS, p.BARRAS, p.ST, p.PS`
        : `p.IDPRO, p.DESCRICAO, p.UNIDADE, p.ATUAL, p.MINIMO, p.VENDA, p.DS_FABR, p.GRUPO`;

    const exportAll = req.query.export === '1';
    const limitSql = exportAll ? '' : 'LIMIT ? OFFSET ?';
    const queryParams = exportAll ? params : [...params, limit, offset];

    const [rows] = await db.query(
      `SELECT ${fields} FROM knoll_produtos p ${whereSql} ${orderSql} ${limitSql}`,
      queryParams
    );

    res.json({
      meta: meta(req, empresa, total, page, totalPages, tipo, 'Relatório de Peças'),
      data: rows,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------- Relatório Produtos ----------
router.get(
  '/produtos',
  requirePermission('rel_produtos.consulta'),
  async (req, res) => {
    try {
      const empresa = await getEmpresa();
      const { page, limit, offset } = paginate(req.query);
      const tipo = req.query.tipo === 'detalhado' ? 'detalhado' : 'sintetico';
      const { whereSql, params, orderSql } = buildProdutoFilters(req.query, {
        pecas: false,
      });

      const [countRows] = await db.query(
        `SELECT COUNT(*) AS total FROM knoll_produtos p ${whereSql}`,
        params
      );
      const total = countRows[0].total;
      const totalPages = Math.ceil(total / limit) || 1;

      const fields =
        tipo === 'detalhado'
          ? `p.IDPRO, p.DESCRICAO, p.MODELO, p.UNIDADE, p.CUSTO, p.VENDA, p.MARGEM,
             p.MINIMO, p.MAXIMO, p.ATUAL, p.DS_FABR, p.DS_MARCA, p.DS_LINHA, p.GRUPO, p.OBS, p.BARRAS, p.ST, p.PS`
          : `p.IDPRO, p.DESCRICAO, p.UNIDADE, p.ATUAL, p.MINIMO, p.VENDA, p.DS_FABR, p.DS_MARCA, p.GRUPO`;

      const exportAll = req.query.export === '1';
      const limitSql = exportAll ? '' : 'LIMIT ? OFFSET ?';
      const queryParams = exportAll ? params : [...params, limit, offset];

      const [rows] = await db.query(
        `SELECT ${fields} FROM knoll_produtos p ${whereSql} ${orderSql} ${limitSql}`,
        queryParams
      );

      res.json({
        meta: meta(req, empresa, total, page, totalPages, tipo, 'Relatório de Produtos'),
        data: rows,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
