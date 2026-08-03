/** Recalcula totais a partir dos itens (evita VAL_* corrompidos pelo FORMAT do legado). */
function calcTotaisOS(os, itens = []) {
  const num = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };
  const round = (v) => Math.round((num(v) + Number.EPSILON) * 100) / 100;

  let valSer = 0;
  let valPro = 0;
  for (const item of itens) {
    const tot = round(item.VAL_TOT != null ? item.VAL_TOT : num(item.QTDE) * num(item.VAL_UNI));
    const ps = String(item.PS || '').trim().toUpperCase();
    if (ps === 'S') valSer += tot;
    else valPro += tot;
  }
  valSer = round(valSer);
  valPro = round(valPro);

  let valDes = round(os?.VAL_DES);
  const somaItens = round(valSer + valPro);
  if (somaItens > 0 && valDes > somaItens) {
    const maybe = round(valDes / 100);
    valDes = maybe <= somaItens ? maybe : 0;
  }

  if (itens.length > 0) {
    return {
      VAL_SER: valSer,
      VAL_PRO: valPro,
      VAL_DES: valDes,
      VAL_TOT: round(valSer + valPro - valDes),
    };
  }

  return {
    VAL_SER: round(os?.VAL_SER),
    VAL_PRO: round(os?.VAL_PRO),
    VAL_DES: valDes,
    VAL_TOT: round(os?.VAL_TOT || num(os?.VAL_SER) + num(os?.VAL_PRO) - valDes),
  };
}

module.exports = { calcTotaisOS };
