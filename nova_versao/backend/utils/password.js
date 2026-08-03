const bcrypt = require('bcryptjs');

const BCRYPT_ROUNDS = 10;
const LEGACY_PASS_MAX = 6;

function isBcryptHash(value) {
  return typeof value === 'string' && /^\$2[aby]?\$\d{2}\$/.test(value);
}

async function hashPassword(plain) {
  return bcrypt.hash(String(plain), BCRYPT_ROUNDS);
}

/**
 * Verifica senha com convivência legado (texto puro) + bcrypt.
 * Retorna { ok, upgradedHash } — upgradedHash preenchido quando migra de plaintext.
 */
async function verifyPassword(plain, storedPass, storedHash = null) {
  const password = String(plain ?? '');

  if (storedHash && isBcryptHash(storedHash)) {
    const ok = await bcrypt.compare(password, storedHash);
    return { ok, upgradedHash: null };
  }

  // Hash eventualmente gravado em cd_pass (coluna ampliada)
  if (isBcryptHash(storedPass)) {
    const ok = await bcrypt.compare(password, storedPass);
    return { ok, upgradedHash: null };
  }

  const legacyOk = storedPass != null && String(storedPass) === password;
  if (!legacyOk) return { ok: false, upgradedHash: null };

  const upgradedHash = await hashPassword(password);
  return { ok: true, upgradedHash };
}

function legacyPlainPassword(plain) {
  return String(plain ?? '').substring(0, LEGACY_PASS_MAX);
}

module.exports = {
  hashPassword,
  verifyPassword,
  isBcryptHash,
  legacyPlainPassword,
  LEGACY_PASS_MAX,
};
