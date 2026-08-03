import { apiFetch, buildQuery } from './api';

export function mapCliente(c) {
  return {
    value: c.IDCLI,
    label: c.NOME || `Cliente #${c.IDCLI}`,
    sublabel: [c.TELEFONE || c.CELULAR, c.MUNICIPIO, `#${c.IDCLI}`].filter(Boolean).join(' · '),
    raw: c,
  };
}

export function mapTecnico(t) {
  return {
    value: t.IDFUN,
    label: t.NOME || `Técnico #${t.IDFUN}`,
    sublabel: [t.MUNICIPIO, t.CELULAR || t.FONE, `#${t.IDFUN}`].filter(Boolean).join(' · '),
    raw: t,
  };
}

export function mapProduto(p) {
  const tipo = String(p.PS || '').toUpperCase() === 'P' ? 'Peça' : 'Produto';
  return {
    value: p.IDPRO,
    label: p.DESCRICAO || `Item #${p.IDPRO}`,
    sublabel: `${tipo} · #${p.IDPRO}${p.VENDA != null ? ` · R$ ${Number(p.VENDA).toFixed(2)}` : ''}`,
    raw: p,
  };
}

export function mapEquipamento(e) {
  const parts = [e.DS_EQPM, e.DS_MODL, e.DS_SERI || e.NM_SERIE].filter(Boolean);
  return {
    value: e.CD_EQPM,
    label: parts[0] || `Equip. #${e.CD_EQPM}`,
    sublabel: [...parts.slice(1), e.NM_MARC, `#${e.CD_EQPM}`].filter(Boolean).join(' · '),
    raw: e,
  };
}

export async function searchClientes(q) {
  const res = await apiFetch(`/clientes${buildQuery({ q, limit: 20, page: 1 })}`);
  return (res.data || []).map(mapCliente);
}

export async function searchTecnicos(q) {
  const res = await apiFetch(`/tecnicos${buildQuery({ q, limit: 50 })}`);
  return (Array.isArray(res) ? res : res.data || []).map(mapTecnico);
}

export async function searchProdutos(q, tipo = 'all') {
  const res = await apiFetch(`/produtos${buildQuery({ q, tipo, limit: 25 })}`);
  return (res.data || []).map(mapProduto);
}

export async function searchPecas(q) {
  return searchProdutos(q, 'peca');
}

export async function searchEquipamentos(idcli, q) {
  if (!idcli) return [];
  const res = await apiFetch(`/clientes/${idcli}/equipamentos${buildQuery({ q, limit: 30 })}`);
  return (res.data || []).map(mapEquipamento);
}

export async function createClienteQuick(form) {
  const res = await apiFetch('/clientes', {
    method: 'POST',
    body: JSON.stringify({
      NOME: form.NOME,
      TELEFONE: form.TELEFONE || '',
      CELULAR: form.CELULAR || '',
      EMAIL: form.EMAIL || '',
      MUNICIPIO: form.MUNICIPIO || '',
      ESTADO: form.ESTADO || 'SC',
    }),
  });
  const full = await apiFetch(`/clientes/${res.id}`);
  return mapCliente(full);
}

export async function createTecnicoQuick(form) {
  const res = await apiFetch('/tecnicos', {
    method: 'POST',
    body: JSON.stringify({ NOME: form.NOME, FONE: form.FONE || '', CELULAR: form.CELULAR || '' }),
  });
  return mapTecnico(res);
}

export async function createProdutoQuick(form, tipo = 'produto') {
  const res = await apiFetch('/produtos', {
    method: 'POST',
    body: JSON.stringify({
      DESCRICAO: form.DESCRICAO,
      UNIDADE: form.UNIDADE || 'UN',
      VENDA: form.VENDA || 0,
      PS: tipo === 'peca' ? 'P' : (form.PS || 'S'),
    }),
  });
  return mapProduto(res);
}

export async function createEquipamentoQuick(idcli, form) {
  const res = await apiFetch(`/clientes/${idcli}/equipamentos`, {
    method: 'POST',
    body: JSON.stringify({
      DS_EQPM: form.DS_EQPM,
      DS_MODL: form.DS_MODL || '',
      DS_SERI: form.DS_SERI || '',
      NM_MARC: form.NM_MARC || '',
    }),
  });
  return mapEquipamento(res);
}
