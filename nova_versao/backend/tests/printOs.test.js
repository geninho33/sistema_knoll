const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// Espelho da regra de formatação monetária / totais do frontend (money.js)
function toNumber(value) {
  if (value == null || value === '') return 0;
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const raw = String(value).trim();
  if (!raw) return 0;
  if (raw.includes(',') && raw.includes('.')) {
    if (raw.lastIndexOf(',') > raw.lastIndexOf('.')) {
      return Number(raw.replace(/\./g, '').replace(',', '.')) || 0;
    }
    return Number(raw.replace(/,/g, '')) || 0;
  }
  if (raw.includes(',')) return Number(raw.replace(',', '.')) || 0;
  return Number(raw) || 0;
}

function roundMoney(value) {
  return Math.round((toNumber(value) + Number.EPSILON) * 100) / 100;
}

function calcTotaisOS(os = {}, itens = []) {
  let valSer = 0;
  let valPro = 0;
  for (const item of itens) {
    const tot = roundMoney(item.VAL_TOT ?? (toNumber(item.QTDE) * toNumber(item.VAL_UNI)));
    const ps = String(item.PS || '').trim().toUpperCase();
    if (ps === 'S') valSer += tot;
    else valPro += tot;
  }
  valSer = roundMoney(valSer);
  valPro = roundMoney(valPro);
  const valDes = roundMoney(os.VAL_DES);
  if (itens.length > 0) {
    return { VAL_SER: valSer, VAL_PRO: valPro, VAL_DES: valDes, VAL_TOT: roundMoney(valSer + valPro - valDes) };
  }
  return {
    VAL_SER: roundMoney(os.VAL_SER),
    VAL_PRO: roundMoney(os.VAL_PRO),
    VAL_DES: valDes,
    VAL_TOT: roundMoney(os.VAL_TOT || toNumber(os.VAL_SER) + toNumber(os.VAL_PRO) - valDes),
  };
}

describe('impressão OS — totais e equipamento', () => {
  it('corrige total absurdo do cabeçalho (caso 55622)', () => {
    const itens = [
      { PS: 'P', VAL_TOT: 450 }, { PS: 'P', VAL_TOT: 100 }, { PS: 'P', VAL_TOT: 1100 },
      { PS: 'P', VAL_TOT: 180 }, { PS: 'P', VAL_TOT: 400 }, { PS: 'P', VAL_TOT: 490 },
      { PS: 'P', VAL_TOT: 900 }, { PS: 'P', VAL_TOT: 160 }, { PS: 'P', VAL_TOT: 120 },
      { PS: 'P', VAL_TOT: 450 }, { PS: 'P', VAL_TOT: 650 }, { PS: 'P', VAL_TOT: 480 },
      { PS: 'P', VAL_TOT: 240 }, { PS: 'P', VAL_TOT: 790 },
    ];
    const tot = calcTotaisOS({ VAL_TOT: 651000, VAL_PRO: 651000 }, itens);
    assert.equal(tot.VAL_TOT, 6510);
  });

  it('prioriza nome do equipamento da tabela de produtos', () => {
    const os = { EQUIPAMENTO: 'Garantia', EQUIPAMENTO_NOME: null, DEFEITO: null };
    const equipamentos = [{ DS_EQPM: 'INSTALAÇÕES ELETROSDOMESTICOS', DEFEITO: 'Mão de obra' }];
    const nome = os.EQUIPAMENTO_NOME
      || equipamentos.map((eq) => eq.DS_EQPM).filter(Boolean).join('; ')
      || os.EQUIPAMENTO
      || '-';
    const defeito = os.DEFEITO
      || equipamentos.map((eq) => eq.DEFEITO).filter(Boolean).join(' | ')
      || '-';
    assert.equal(nome, 'INSTALAÇÕES ELETROSDOMESTICOS');
    assert.equal(defeito, 'Mão de obra');
    assert.notEqual(nome, 'Garantia');
  });
});
