const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { hashPassword, verifyPassword, isBcryptHash, legacyPlainPassword } = require('../utils/password');
const { calcTotaisOS } = require('../utils/osTotals');

describe('password utils', () => {
  it('gera hash bcrypt', async () => {
    const hash = await hashPassword('372845');
    assert.equal(isBcryptHash(hash), true);
  });

  it('aceita senha legado plaintext e sugere upgrade', async () => {
    const result = await verifyPassword('372845', '372845', null);
    assert.equal(result.ok, true);
    assert.equal(isBcryptHash(result.upgradedHash), true);
  });

  it('valida senha com hash bcrypt', async () => {
    const hash = await hashPassword('segredo');
    const result = await verifyPassword('segredo', 'xxxxxx', hash);
    assert.equal(result.ok, true);
    assert.equal(result.upgradedHash, null);
  });

  it('rejeita senha incorreta', async () => {
    const result = await verifyPassword('errada', '372845', null);
    assert.equal(result.ok, false);
  });

  it('mantém compatibilidade legado 6 chars', () => {
    assert.equal(legacyPlainPassword('123456789'), '123456');
  });
});

describe('calcTotaisOS', () => {
  it('recalcula a partir dos itens e ignora cabeçalho corrompido', () => {
    const os = { VAL_SER: null, VAL_PRO: 651000, VAL_DES: null, VAL_TOT: 651000 };
    const itens = [
      { PS: 'P', VAL_TOT: 450 },
      { PS: 'P', VAL_TOT: 100 },
      { PS: 'S', VAL_TOT: 200 },
    ];
    const tot = calcTotaisOS(os, itens);
    assert.equal(tot.VAL_PRO, 550);
    assert.equal(tot.VAL_SER, 200);
    assert.equal(tot.VAL_TOT, 750);
  });

  it('usa equipamento/defeito indireto sem itens', () => {
    const tot = calcTotaisOS({ VAL_SER: 10, VAL_PRO: 20, VAL_DES: 5, VAL_TOT: 25 }, []);
    assert.equal(tot.VAL_TOT, 25);
  });
});

describe('RBAC canAccess (regra espelhada)', () => {
  function canAccess(user, moduleId) {
    if (!user) return false;
    if (moduleId === 'home') return true;
    if (user.perfilId === 1) return true;
    const perms = user.permissions || [];
    if (perms.length === 0) return false;
    return perms.includes(`${moduleId}.consulta`) || perms.includes(`${moduleId}.escrita`);
  }

  it('admin acessa tudo', () => {
    assert.equal(canAccess({ perfilId: 1, permissions: [] }, 'admin_usuarios'), true);
  });

  it('sem permissões não acessa módulos', () => {
    assert.equal(canAccess({ perfilId: 2, permissions: [] }, 'clientes'), false);
    assert.equal(canAccess({ perfilId: 2, permissions: [] }, 'home'), true);
  });

  it('respeita permissão de consulta', () => {
    assert.equal(
      canAccess({ perfilId: 2, permissions: ['ordens.consulta'] }, 'ordens'),
      true
    );
    assert.equal(
      canAccess({ perfilId: 2, permissions: ['ordens.consulta'] }, 'clientes'),
      false
    );
  });
});
