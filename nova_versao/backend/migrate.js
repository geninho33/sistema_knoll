const fs = require('fs');
const path = require('path');
const db = require('./db');

function splitSql(sql) {
  // Remove block comments and line comments, then split by semicolon
  const cleaned = sql
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .map((line) => {
      const idx = line.indexOf('--');
      if (idx >= 0) return line.slice(0, idx);
      return line;
    })
    .join('\n');

  return cleaned
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

async function tableExists(conn, tableName) {
  const [rows] = await conn.query(
    `SELECT 1 AS ok
     FROM information_schema.tables
     WHERE table_schema = DATABASE() AND table_name = ?
     LIMIT 1`,
    [tableName]
  );
  return rows.length > 0;
}

async function ensureConfigColumns(conn) {
  if (!(await tableExists(conn, 'knoll_configuracao'))) {
    console.log('⏭  knoll_configuracao ainda não existe (será criada pelas migrations)');
    return;
  }
  const [cols] = await conn.query(`SHOW COLUMNS FROM knoll_configuracao`);
  const names = new Set(cols.map((c) => c.Field));
  if (!names.has('nu_ie')) {
    await conn.query(`ALTER TABLE knoll_configuracao ADD COLUMN nu_ie VARCHAR(20) NULL AFTER nu_cnpj`);
  }
  if (!names.has('ds_obs')) {
    await conn.query(`ALTER TABLE knoll_configuracao ADD COLUMN ds_obs TEXT NULL`);
  }
  if (!names.has('ds_logo')) {
    await conn.query(`ALTER TABLE knoll_configuracao ADD COLUMN ds_logo VARCHAR(255) NULL`);
  }
}

async function ensurePasswordColumns(conn) {
  if (await tableExists(conn, 'knoll_usuarios')) {
    try {
      await conn.query(`ALTER TABLE knoll_usuarios MODIFY COLUMN cd_pass VARCHAR(100) NULL`);
    } catch (_) {
      /* ignore */
    }
  }
  if (!(await tableExists(conn, 'sys_usuarios'))) {
    console.log('⏭  sys_usuarios ainda não existe (será criada pelas migrations)');
    return;
  }
  const [cols] = await conn.query(`SHOW COLUMNS FROM sys_usuarios`);
  const names = new Set(cols.map((c) => c.Field));
  if (!names.has('password_hash')) {
    await conn.query(`ALTER TABLE sys_usuarios ADD COLUMN password_hash VARCHAR(100) NULL AFTER email`);
  }
}

async function run() {
  const dir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();

  await db.query(`
    CREATE TABLE IF NOT EXISTS sys_migrations (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      filename VARCHAR(120) NOT NULL UNIQUE,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  const [done] = await db.query('SELECT filename FROM sys_migrations');
  const executed = new Set(done.map((r) => r.filename));

  for (const file of files) {
    if (executed.has(file)) {
      console.log(`⏭  Já aplicada: ${file}`);
      continue;
    }

    const sql = fs.readFileSync(path.join(dir, file), 'utf8');
    const statements = splitSql(sql);

    console.log(`▶  Aplicando ${file} (${statements.length} statements)...`);
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      for (const stmt of statements) {
        await conn.query(stmt);
      }
      await conn.query('INSERT INTO sys_migrations (filename) VALUES (?)', [file]);
      await conn.commit();
      console.log(`✅ ${file}`);
    } catch (err) {
      await conn.rollback();
      console.error(`❌ Falha em ${file}:`, err.message);
      throw err;
    } finally {
      conn.release();
    }
  }

  // Ajustes idempotentes após o schema existir
  {
    const conn = await db.getConnection();
    try {
      await ensureConfigColumns(conn);
      await ensurePasswordColumns(conn);
    } finally {
      conn.release();
    }
  }

  console.log('Migrations concluídas.');
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
