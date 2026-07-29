/**
 * Valores monetários do legado (knoll_servicos) podem estar corrompidos:
 * o PHP grava FORMAT(sum,2) → "6,510.00" em coluna DOUBLE, gerando 651000.
 * Sempre preferir o somatório dos itens quando existirem.
 */

export function toNumber(value) {
  if (value == null || value === '') return 0;
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const raw = String(value).trim();
  if (!raw) return 0;
  // BR: 1.234,56  |  US/legado FORMAT: 1,234.56  |  puro: 1234.56
  if (raw.includes(',') && raw.includes('.')) {
    if (raw.lastIndexOf(',') > raw.lastIndexOf('.')) {
      return Number(raw.replace(/\./g, '').replace(',', '.')) || 0;
    }
    return Number(raw.replace(/,/g, '')) || 0;
  }
  if (raw.includes(',')) return Number(raw.replace(',', '.')) || 0;
  return Number(raw) || 0;
}

export function formatMoney(value) {
  return toNumber(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function roundMoney(value) {
  return Math.round((toNumber(value) + Number.EPSILON) * 100) / 100;
}

/**
 * Recalcula totais da OS a partir dos itens (PS = S serviço / P produto).
 * Desconto vem do cabeçalho, sanitizado.
 */
export function calcTotaisOS(os = {}, itens = []) {
  let valSer = 0;
  let valPro = 0;
  let valItens = 0;

  for (const item of itens) {
    const tot = roundMoney(item.VAL_TOT ?? (toNumber(item.QTDE) * toNumber(item.VAL_UNI)));
    valItens += tot;
    const ps = String(item.PS || '').trim().toUpperCase();
    if (ps === 'S') valSer += tot;
    else if (ps === 'P') valPro += tot;
    else valPro += tot; // sem classificação: trata como produto/material
  }

  valSer = roundMoney(valSer);
  valPro = roundMoney(valPro);
  valItens = roundMoney(valItens);

  let valDes = roundMoney(os.VAL_DES);
  // Se o desconto também foi corrompido pelo FORMAT (ex.: 100x o esperado),
  // limita ao total dos itens.
  if (valItens > 0 && valDes > valItens) {
    const maybe = roundMoney(valDes / 100);
    if (maybe <= valItens) valDes = maybe;
    else valDes = 0;
  }

  const hasItens = Array.isArray(itens) && itens.length > 0;
  if (hasItens) {
    return {
      VAL_SER: valSer,
      VAL_PRO: valPro,
      VAL_DES: valDes,
      VAL_TOT: roundMoney(valSer + valPro - valDes),
      _fonte: 'itens',
    };
  }

  // Sem itens: tenta usar cabeçalho, corrigindo padrão clássico *100 do FORMAT
  let valSerH = roundMoney(os.VAL_SER);
  let valProH = roundMoney(os.VAL_PRO);
  let valTotH = roundMoney(os.VAL_TOT);
  const somaH = roundMoney(valSerH + valProH - valDes);
  if (valTotH > 0 && somaH > 0 && Math.abs(valTotH - somaH * 100) < 1) {
    valSerH = roundMoney(valSerH / 100);
    valProH = roundMoney(valProH / 100);
    valTotH = roundMoney(valTotH / 100);
  } else if (valTotH === 0 && somaH > 0) {
    valTotH = somaH;
  }

  return {
    VAL_SER: valSerH,
    VAL_PRO: valProH,
    VAL_DES: valDes,
    VAL_TOT: valTotH || roundMoney(valSerH + valProH - valDes),
    _fonte: 'cabecalho',
  };
}
