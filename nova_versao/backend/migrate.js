const fs = require('fs');
const path = require('path');
const db = require('./db');

function splitSql(sql) {
  // Remove /* */ comments; keep line comments only when -- starts a segment outside strings
  let cleaned = sql.replace(/\/\*[\s\S]*?\*\//g, '');
  const out = [];
  let buf = '';
  let inSingle = false;
  let inDouble = false;
  let i = 0;
  while (i < cleaned.length) {
    const ch = cleaned[i];
    const next = cleaned[i + 1];

    if (!inSingle && !inDouble && ch === '-' && next === '-') {
      // skip until end of line
      while (i < cleaned.length && cleaned[i] !== '\n') i += 1;
      continue;
    }

    if (ch === "'" && !inDouble) {
      // handle escaped '' inside single quotes
      if (inSingle && next === "'") {
        buf += "''";
        i += 2;
        continue;
      }
      inSingle = !inSingle;
      buf += ch;
      i += 1;
      continue;
    }

    if (ch === '"' && !inSingle) {
      inDouble = !inDouble;
      buf += ch;
      i += 1;
      continue;
    }

    if (ch === ';' && !inSingle && !inDouble) {
      const stmt = buf.trim();
      if (stmt) out.push(stmt);
      buf = '';
      i += 1;
      continue;
    }

    buf += ch;
    i += 1;
  }
  const tail = buf.trim();
  if (tail) out.push(tail);
  return out;
}

async function tableExists(conn, tableName) {
  const [rows] = await conn.query(
    `SELECT 1 AS ok
     FROM information_schema.tables
     WHERE table_schema = DATABASE()
       AND table_name = ?
     LIMIT 1`,
    [tableName]
  );
  return rows.length > 0;
}

async function columnExists(conn, tableName, columnName) {
  const [rows] = await conn.query(
    `SELECT 1 AS ok
     FROM information_schema.columns
     WHERE table_schema = DATABASE()
       AND table_name = ?
       AND column_name = ?
     LIMIT 1`,
    [tableName, columnName]
  );
  return rows.length > 0;
}

async function addColumnIfMissing(conn, tableName, columnName, definition) {
  if (!(await tableExists(conn, tableName))) {
    console.log(`⏭  Tabela ausente: ${tableName} (pulei coluna ${columnName})`);
    return false;
  }
  if (await columnExists(conn, tableName, columnName)) {
    return false;
  }
  await conn.query(`ALTER TABLE \`${tableName}\` ADD COLUMN ${definition}`);
  console.log(`➕  ${tableName}.${columnName}`);
  return true;
}

async function ensureConfigColumns(conn) {
  await addColumnIfMissing(conn, 'knoll_configuracao', 'nu_ie', 'nu_ie VARCHAR(20) NULL');
  await addColumnIfMissing(conn, 'knoll_configuracao', 'ds_obs', 'ds_obs TEXT NULL');
  await addColumnIfMissing(conn, 'knoll_configuracao', 'ds_logo', 'ds_logo VARCHAR(255) NULL');
}

async function ensurePasswordColumns(conn) {
  if (await tableExists(conn, 'knoll_usuarios')) {
    try {
      await conn.query(`ALTER TABLE knoll_usuarios MODIFY COLUMN cd_pass VARCHAR(100) NULL`);
    } catch (_) {
      /* ignore */
    }
  }
  await addColumnIfMissing(conn, 'sys_usuarios', 'password_hash', 'password_hash VARCHAR(100) NULL');
}

/** Reparo idempotente pós-dump / schema legado incompleto */
async function repairSchema(conn) {
  console.log('🔧 Executando repair de schema...');
  await ensureConfigColumns(conn);
  await ensurePasswordColumns(conn);

  // Colunas usadas pela API nova em tabelas legadas
  await addColumnIfMissing(conn, 'knoll_clientes', 'COMPLEMENTO', 'COMPLEMENTO VARCHAR(150) NULL');
  await addColumnIfMissing(conn, 'knoll_clientes', 'CELULAR', 'CELULAR VARCHAR(20) NULL');
  await addColumnIfMissing(conn, 'knoll_clientes', 'EMAIL', 'EMAIL VARCHAR(120) NULL');
  await addColumnIfMissing(conn, 'knoll_servicos', 'IN_STATUS', 'IN_STATUS VARCHAR(40) NULL');
  await addColumnIfMissing(conn, 'knoll_servicos', 'TIPO', 'TIPO VARCHAR(30) NULL');
  await addColumnIfMissing(conn, 'knoll_servicos', 'HR_SERV', 'HR_SERV CHAR(5) NULL');
  await addColumnIfMissing(conn, 'knoll_servicos_itens', 'PS', "PS CHAR(1) NULL DEFAULT 'P'");
  await addColumnIfMissing(conn, 'knoll_produtos', 'PS', "PS CHAR(1) NULL DEFAULT 'S'");
  await addColumnIfMissing(conn, 'knoll_produtos', 'VENDA', 'VENDA DOUBLE NULL DEFAULT 0');
  await addColumnIfMissing(conn, 'knoll_clientes_produtos', 'DEFEITO', 'DEFEITO VARCHAR(400) NULL');
  await addColumnIfMissing(conn, 'knoll_clientes_produtos', 'NM_MARC', 'NM_MARC VARCHAR(60) NULL');

  console.log('🔧 Repair concluído.');
}

async function listMigrationFiles() {
  const dir = path.join(__dirname, 'migrations');
  return fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
}

async function ensureMigrationsTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS sys_migrations (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      filename VARCHAR(120) NOT NULL UNIQUE,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
}

async function showStatus() {
  await ensureMigrationsTable();
  const files = await listMigrationFiles();
  const [done] = await db.query('SELECT filename, executed_at FROM sys_migrations ORDER BY id');
  const executed = new Map(done.map((r) => [r.filename, r.executed_at]));

  console.log('Status das migrations:');
  console.log(`  Banco: ${process.env.DB_NAME || '(DB_NAME)'} @ ${process.env.DB_HOST || 'localhost'}`);
  for (const file of files) {
    if (executed.has(file)) {
      console.log(`  ✅ ${file}  (em ${executed.get(file)})`);
    } else {
      console.log(`  ⏳ ${file}  (pendente)`);
    }
  }
  const pending = files.filter((f) => !executed.has(f));
  console.log(`Resumo: ${files.length - pending.length}/${files.length} aplicadas, ${pending.length} pendente(s).`);
  if (pending.length === 0) {
    console.log('Obs.: arquivos já registrados em sys_migrations NÃO são reexecutados.');
    console.log('      Para ajustes de schema após dump, use: node migrate.js repair');
  }
  return pending;
}

async function applyPending() {
  await ensureMigrationsTable();
  const files = await listMigrationFiles();
  const [done] = await db.query('SELECT filename FROM sys_migrations');
  const executed = new Set(done.map((r) => r.filename));
  let applied = 0;

  for (const file of files) {
    if (executed.has(file)) {
      console.log(`⏭  Já aplicada: ${file}`);
      continue;
    }

    const full = path.join(__dirname, 'migrations', file);
    const sql = fs.readFileSync(full, 'utf8');
    const statements = splitSql(sql);

    console.log(`▶  Aplicando ${file} (${statements.length} statements)...`);
    const conn = await db.getConnection();
    try {
      // DDL no MySQL faz commit implícito; aplicamos statement a statement
      // e só então registramos o arquivo.
      for (const stmt of statements) {
        await conn.query(stmt);
      }
      await conn.query('INSERT INTO sys_migrations (filename) VALUES (?)', [file]);
      console.log(`✅ ${file}`);
      applied += 1;
    } catch (err) {
      console.error(`❌ Falha em ${file}:`, err.message);
      console.error('   Statement pode ter sido parcialmente aplicado (DDL). Corrija e rode novamente.');
      throw err;
    } finally {
      conn.release();
    }
  }

  return applied;
}

async function runRepair() {
  const conn = await db.getConnection();
  try {
    await repairSchema(conn);
  } finally {
    conn.release();
  }
}

async function main() {
  const cmd = (process.argv[2] || 'up').toLowerCase();

  if (cmd === 'status') {
    await showStatus();
    process.exit(0);
  }

  if (cmd === 'repair') {
    await showStatus();
    await runRepair();
    console.log('Repair finalizado.');
    process.exit(0);
  }

  // default: up
  console.log('==> migrate up');
  await showStatus();
  const applied = await applyPending();
  await runRepair();
  console.log(applied > 0
    ? `Migrations concluídas (${applied} arquivo(s) novo(s)).`
    : 'Nenhuma migration pendente. Schema repair executado mesmo assim.');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
