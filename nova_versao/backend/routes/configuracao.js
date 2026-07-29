const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const db = require('../db');
const { authMiddleware, requirePermission } = require('../middleware/auth');
const { registrarAuditoria } = require('../utils/audit');

const router = express.Router();

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'empresa');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase() || '.png';
    cb(null, `logo_${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    return cb(new Error('Formato inválido. Use PNG, JPG, WEBP ou SVG.'));
  },
});

function mapConfig(row) {
  if (!row) return null;
  const logoPath = row.ds_logo || null;
  return {
    ...row,
    logo_url: logoPath ? `/uploads/empresa/${path.basename(logoPath)}` : null,
  };
}

async function getConfigRow() {
  const [rows] = await db.query(`SELECT * FROM knoll_configuracao LIMIT 1`);
  return rows[0] || null;
}

router.get('/', authMiddleware, async (req, res) => {
  try {
    const row = await getConfigRow();
    if (!row) {
      return res.json({
        nm_empr: '',
        ds_razao: '',
        nu_cnpj: '',
        nu_ie: '',
        nu_cep: '',
        nm_logr: '',
        nu_logr: '',
        nm_barr: '',
        nm_munc: '',
        sg_estd: 'SC',
        nu_telf: '',
        nu_telf2: '',
        nu_fax: '',
        ds_email: '',
        ds_obs: '',
        ds_logo: null,
        logo_url: null,
        ultimo_servico: null,
      });
    }
    res.json(mapConfig(row));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Público autenticado leve para header/impressão (qualquer usuário logado)
router.get('/public', authMiddleware, async (req, res) => {
  try {
    const row = await getConfigRow();
    res.json({
      nm_empr: row?.nm_empr || 'MARLON KNOLL',
      ds_razao: row?.ds_razao || '',
      nu_cnpj: row?.nu_cnpj || '',
      nu_telf: row?.nu_telf || '',
      logo_url: row?.ds_logo ? `/uploads/empresa/${path.basename(row.ds_logo)}` : null,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/', authMiddleware, requirePermission('admin_empresa.escrita'), async (req, res) => {
  try {
    const {
      nm_empr, ds_razao, nu_cnpj, nu_ie, nu_cep, nm_logr, nu_logr,
      nm_barr, nm_munc, sg_estd, nu_telf, nu_telf2, nu_fax, ds_email, ds_obs,
    } = req.body || {};

    const atual = await getConfigRow();
    if (!atual) {
      await db.query(
        `INSERT INTO knoll_configuracao
          (nm_empr, ds_razao, nu_cnpj, nu_ie, nu_cep, nm_logr, nu_logr, nm_barr, nm_munc, sg_estd, nu_telf, nu_telf2, nu_fax, ds_email, ds_obs)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          nm_empr || '', ds_razao || '', nu_cnpj || null, nu_ie || null, nu_cep || '',
          nm_logr || '', nu_logr || '', nm_barr || '', nm_munc || '', sg_estd || '',
          nu_telf || '', nu_telf2 || '', nu_fax || null, ds_email || '', ds_obs || null,
        ]
      );
    } else {
      await db.query(
        `UPDATE knoll_configuracao SET
          nm_empr = ?, ds_razao = ?, nu_cnpj = ?, nu_ie = ?, nu_cep = ?,
          nm_logr = ?, nu_logr = ?, nm_barr = ?, nm_munc = ?, sg_estd = ?,
          nu_telf = ?, nu_telf2 = ?, nu_fax = ?, ds_email = ?, ds_obs = ?`,
        [
          nm_empr || '', ds_razao || '', nu_cnpj || null, nu_ie || null, nu_cep || '',
          nm_logr || '', nu_logr || '', nm_barr || '', nm_munc || '', sg_estd || '',
          nu_telf || '', nu_telf2 || '', nu_fax || null, ds_email || '', ds_obs || null,
        ]
      );
    }

    await registrarAuditoria({
      usuarioId: req.user.sysId,
      usuarioNome: req.user.username,
      tabela: 'knoll_configuracao',
      registroId: '1',
      operacao: atual ? 'UPDATE' : 'INSERT',
      valoresAnteriores: atual,
      valoresNovos: req.body,
      ip: req.clientIp,
    });

    const updated = await getConfigRow();
    res.json({ success: true, data: mapConfig(updated) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post(
  '/logo',
  authMiddleware,
  requirePermission('admin_empresa.escrita'),
  (req, res) => {
    upload.single('logo')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message || 'Falha no upload' });
      }
      if (!req.file) {
        return res.status(400).json({ error: 'Arquivo de logo não enviado' });
      }

      try {
        const relative = req.file.filename;
        const atual = await getConfigRow();

        if (atual?.ds_logo) {
          const oldPath = path.join(UPLOAD_DIR, path.basename(atual.ds_logo));
          if (fs.existsSync(oldPath)) {
            try { fs.unlinkSync(oldPath); } catch (_) { /* ignore */ }
          }
        }

        if (!atual) {
          await db.query(
            `INSERT INTO knoll_configuracao (nm_empr, ds_razao, ds_logo) VALUES ('', '', ?)`,
            [relative]
          );
        } else {
          await db.query(`UPDATE knoll_configuracao SET ds_logo = ?`, [relative]);
        }

        await registrarAuditoria({
          usuarioId: req.user.sysId,
          usuarioNome: req.user.username,
          tabela: 'knoll_configuracao',
          registroId: 'logo',
          operacao: 'UPDATE',
          valoresNovos: { ds_logo: relative },
          ip: req.clientIp,
        });

        const updated = await getConfigRow();
        res.json({ success: true, data: mapConfig(updated) });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  }
);

module.exports = router;
