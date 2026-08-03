import { useCallback, useState, useEffect } from 'react';
import { Search, Plus, Edit2, Loader2, Trash2 } from 'lucide-react';
import Modal from './ui/Modal';
import SearchCombobox from './ui/SearchCombobox';
import { Pagination, LoadingBlock, EmptyState, PageHeader } from './ui/Pagination';
import { BotaoImprimirOS } from './ordens/OrdemServicoPrint';
import { apiFetch, buildQuery } from '../utils/api';
import {
  searchClientes,
  searchTecnicos,
  searchProdutos,
  searchPecas,
  searchEquipamentos,
  createClienteQuick,
  createTecnicoQuick,
  createProdutoQuick,
  createEquipamentoQuick,
} from '../utils/entitySearch';

export default function OrdensModule() {
  const [data, setData] = useState({ data: [], totalPages: 1, page: 1, total: 0 });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOrdem, setEditingOrdem] = useState(null);
  const [itensOs, setItensOs] = useState([]);
  const [draftItens, setDraftItens] = useState([]);
  const [loadingItens, setLoadingItens] = useState(false);
  const [error, setError] = useState('');
  const [clienteLabel, setClienteLabel] = useState('');
  const [tecnicoLabel, setTecnicoLabel] = useState('');
  const [equipLabel, setEquipLabel] = useState('');
  const [itemQtde, setItemQtde] = useState(1);
  const [pendingPeca, setPendingPeca] = useState(null);
  const [pendingProduto, setPendingProduto] = useState(null);
  const [pecaLabel, setPecaLabel] = useState('');
  const [produtoLabel, setProdutoLabel] = useState('');
  const [savingItem, setSavingItem] = useState(false);

  const getInitialForm = () => ({
    IDCLI: '', EQUIPAMENTO: '', DEFEITO: '', IN_STATUS: 'Aberto',
    DT_SADA: '', HR_SADA: '', HR_SERV: '', IDFUN: '', TIPO: 'Garantia',
    VAL_SER: 0, VAL_PRO: 0, VAL_DES: 0, VAL_TOT: 0, SERVICO: '',
    CD_EQPM: '',
  });

  const [formData, setFormData] = useState(getInitialForm());

  const fetchOrdens = async (pageNum, query) => {
    setLoading(true);
    setError('');
    try {
      const result = await apiFetch(`/ordens${buildQuery({ page: pageNum, limit: 10, q: query })}`);
      setData(result);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Falha ao carregar ordens');
    } finally {
      setLoading(false);
    }
  };

  const fetchItens = async (idser) => {
    setLoadingItens(true);
    try {
      const result = await apiFetch(`/ordens/${idser}/itens`);
      setItensOs(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingItens(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => fetchOrdens(page, search), 400);
    return () => clearTimeout(delay);
  }, [page, search]);

  const fetchClientesCb = useCallback((q) => searchClientes(q), []);
  const fetchTecnicosCb = useCallback((q) => searchTecnicos(q), []);
  const fetchPecasCb = useCallback((q) => searchPecas(q), []);
  const fetchProdutosCb = useCallback((q) => searchProdutos(q, 'produto'), []);
  const fetchEquipCb = useCallback(
    (q) => searchEquipamentos(formData.IDCLI, q),
    [formData.IDCLI]
  );

  const resetLabels = () => {
    setClienteLabel('');
    setTecnicoLabel('');
    setEquipLabel('');
    setPecaLabel('');
    setProdutoLabel('');
    setPendingPeca(null);
    setPendingProduto(null);
    setDraftItens([]);
    setItensOs([]);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.IDCLI) {
      setError('Selecione um cliente');
      return;
    }
    const isEdit = !!editingOrdem;
    try {
      const payload = { ...formData };
      delete payload.CD_EQPM;
      let idser = editingOrdem?.IDSER;
      if (isEdit) {
        await apiFetch(`/ordens/${editingOrdem.IDSER}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        const created = await apiFetch('/ordens', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        idser = created.id;
        for (const item of draftItens) {
          await apiFetch(`/ordens/${idser}/itens`, {
            method: 'POST',
            body: JSON.stringify(item),
          });
        }
      }
      setModalOpen(false);
      fetchOrdens(page, search);
    } catch (err) {
      setError(err.message || 'Falha ao salvar ordem');
    }
  };

  const openEdit = async (ordem) => {
    setEditingOrdem(ordem);
    setFormData({
      IDCLI: ordem.IDCLI || '',
      EQUIPAMENTO: ordem.EQUIPAMENTO || '',
      DEFEITO: ordem.DEFEITO || '',
      IN_STATUS: ordem.IN_STATUS || 'Aberto',
      DT_SADA: ordem.DT_SADA && ordem.DT_SADA !== '0000-00-00 00:00:00' ? String(ordem.DT_SADA).split('T')[0] : '',
      HR_SADA: ordem.HR_SADA || '',
      HR_SERV: ordem.HR_SERV || '',
      IDFUN: ordem.IDFUN || '',
      TIPO: ordem.TIPO || 'Garantia',
      VAL_SER: ordem.VAL_SER || 0,
      VAL_PRO: ordem.VAL_PRO || 0,
      VAL_DES: ordem.VAL_DES || 0,
      VAL_TOT: ordem.VAL_TOT || 0,
      SERVICO: ordem.SERVICO || '',
      CD_EQPM: '',
    });
    setClienteLabel(ordem.CLIENTE_NOME || (ordem.IDCLI ? `#${ordem.IDCLI}` : ''));
    setEquipLabel(ordem.EQUIPAMENTO || '');
    setTecnicoLabel('');
    setDraftItens([]);
    setPendingPeca(null);
    setPendingProduto(null);
    setItensOs([]);
    fetchItens(ordem.IDSER);
    setModalOpen(true);

    if (ordem.IDFUN) {
      try {
        const tecs = await searchTecnicos(String(ordem.IDFUN));
        const match = tecs.find((t) => Number(t.value) === Number(ordem.IDFUN));
        if (match) setTecnicoLabel(match.label);
        else setTecnicoLabel(`Técnico #${ordem.IDFUN}`);
      } catch {
        setTecnicoLabel(`Técnico #${ordem.IDFUN}`);
      }
    }
  };

  const openNew = () => {
    setEditingOrdem(null);
    setFormData(getInitialForm());
    resetLabels();
    setModalOpen(true);
  };

  const getStatusColor = (status) => {
    if (!status) return 'bg-slate-100 text-slate-700';
    if (status.includes('Aberto')) return 'bg-blue-100 text-blue-700';
    if (status.includes('Encerrado') || status.includes('Concluído')) return 'bg-emerald-100 text-emerald-700';
    if (status.includes('Aguardando')) return 'bg-amber-100 text-amber-700';
    return 'bg-slate-100 text-slate-700';
  };

  const calculateTotal = (ser, pro, des) => {
    const total = parseFloat(ser || 0) + parseFloat(pro || 0) - parseFloat(des || 0);
    setFormData((prev) => ({ ...prev, VAL_TOT: total.toFixed(2) }));
  };

  const set = (key) => (e) => setFormData({ ...formData, [key]: e.target.value });

  const formatDate = (v) => {
    if (!v || String(v).startsWith('0000')) return '-';
    try { return new Date(v).toLocaleDateString('pt-BR'); } catch { return '-'; }
  };

  const visibleItens = editingOrdem ? itensOs : draftItens;

  const addItemFromOption = async (opt, tipo) => {
    if (!opt) return;
    const raw = opt.raw || {};
    const item = {
      IDPRO: opt.value,
      DESCRICAO: opt.label,
      UNIDADE: raw.UNIDADE || 'UN',
      QTDE: Number(itemQtde) || 1,
      VAL_UNI: Number(raw.VENDA) || 0,
      PS: tipo === 'peca' ? 'P' : (raw.PS || 'S'),
      VAL_TOT: ((Number(itemQtde) || 1) * (Number(raw.VENDA) || 0)).toFixed(2),
    };

    if (editingOrdem) {
      setSavingItem(true);
      try {
        const res = await apiFetch(`/ordens/${editingOrdem.IDSER}/itens`, {
          method: 'POST',
          body: JSON.stringify(item),
        });
        setItensOs(res.data || []);
      } catch (err) {
        setError(err.message || 'Falha ao lançar item');
      } finally {
        setSavingItem(false);
      }
    } else {
      setDraftItens((prev) => {
        const exists = prev.findIndex((i) => Number(i.IDPRO) === Number(item.IDPRO));
        if (exists >= 0) {
          const next = [...prev];
          next[exists] = item;
          return next;
        }
        return [...prev, item];
      });
    }

    if (tipo === 'peca') {
      setPendingPeca(null);
      setPecaLabel('');
    } else {
      setPendingProduto(null);
      setProdutoLabel('');
    }
    setItemQtde(1);
  };

  const removeItem = async (idpro) => {
    if (editingOrdem) {
      setSavingItem(true);
      try {
        const res = await apiFetch(`/ordens/${editingOrdem.IDSER}/itens/${idpro}`, { method: 'DELETE' });
        setItensOs(res.data || []);
      } catch (err) {
        setError(err.message || 'Falha ao remover item');
      } finally {
        setSavingItem(false);
      }
    } else {
      setDraftItens((prev) => prev.filter((i) => Number(i.IDPRO) !== Number(idpro)));
    }
  };

  return (
    <div className="animate-in fade-in duration-500 pb-6">
      <PageHeader
        title="Ordens de Serviço"
        subtitle="Gestão de atendimentos"
        actions={
          <button type="button" onClick={openNew} className="btn-primary w-full sm:w-auto">
            <Plus size={18} /> Nova Ordem
          </button>
        }
      />

      {error && !modalOpen && (
        <p className="mb-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="filter-panel mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
          <input
            type="search"
            placeholder="Buscar por OS, cliente, equipamento..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="field-input pl-10"
            aria-label="Buscar ordens"
          />
        </div>
      </div>

      <div className="card-surface overflow-hidden">
        {loading ? (
          <LoadingBlock />
        ) : (
          <>
            <div className="cards-mobile p-3">
              {(!data.data || data.data.length === 0) && <EmptyState message="Nenhuma O.S. encontrada." />}
              {data.data?.map((o) => (
                <article key={o.IDSER} className="mobile-card">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <p className="font-mono font-bold text-blue-600 text-sm">OS #{o.IDSER}</p>
                      <h3 className="mobile-card-title truncate">{o.CLIENTE_NOME || `Cliente #${o.IDCLI}`}</h3>
                    </div>
                    <button type="button" onClick={() => openEdit(o)} className="btn-icon text-blue-600 bg-blue-50" aria-label={`Editar OS ${o.IDSER}`}>
                      <Edit2 size={16} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(o.IN_STATUS)}`}>{o.IN_STATUS || 'S/ STATUS'}</span>
                    <span className="text-xs text-slate-500">{formatDate(o.DT_SADA)}{o.HR_SADA ? ` ${o.HR_SADA}` : ''}</span>
                  </div>
                  <p className="mobile-card-meta truncate"><span className="font-medium text-slate-700">Equip.:</span> {o.EQUIPAMENTO || '-'}</p>
                  <p className="mobile-card-meta truncate">{o.DEFEITO}</p>
                  <BotaoImprimirOS idser={o.IDSER} className="w-full" />
                </article>
              ))}
            </div>

            <div className="table-desktop overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="p-4">Nº O.S.</th>
                    <th className="p-4">Data</th>
                    <th className="p-4">Cliente</th>
                    <th className="p-4">Equipamento</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data?.length === 0 && <tr><td colSpan="6"><EmptyState message="Nenhuma O.S. encontrada." /></td></tr>}
                  {data.data?.map((o) => (
                    <tr key={o.IDSER} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-4 font-mono font-bold text-blue-600">#{o.IDSER}</td>
                      <td className="p-4 text-slate-500">
                        {formatDate(o.DT_SADA)}{o.HR_SADA ? ` ${o.HR_SADA}` : ''}
                      </td>
                      <td className="p-4 font-semibold text-slate-800">{o.CLIENTE_NOME || `Avulso (${o.IDCLI})`}</td>
                      <td className="p-4">
                        <p className="text-slate-800 font-medium truncate max-w-[220px]">{o.EQUIPAMENTO || '-'}</p>
                        <p className="text-slate-500 text-xs truncate max-w-[220px]">{o.DEFEITO}</p>
                      </td>
                      <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(o.IN_STATUS)}`}>{o.IN_STATUS || 'S/ STATUS'}</span></td>
                      <td className="p-4 text-right">
                        <div className="inline-flex gap-2">
                          <BotaoImprimirOS idser={o.IDSER} />
                          <button type="button" onClick={() => openEdit(o)} className="btn-icon text-blue-600 bg-blue-50" aria-label="Editar">
                            <Edit2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              page={data.page || page}
              totalPages={data.totalPages}
              total={data.total}
              loading={loading}
              onPrev={() => setPage((p) => p - 1)}
              onNext={() => setPage((p) => p + 1)}
            />
          </>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingOrdem ? `Editar O.S. #${editingOrdem.IDSER}` : 'Nova Ordem de Serviço'}
        size="xl"
        footer={
          <>
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary w-full sm:w-auto">Cancelar</button>
            {editingOrdem && <BotaoImprimirOS idser={editingOrdem.IDSER} className="w-full sm:w-auto" />}
            <button type="submit" form="form-os" className="btn-primary w-full sm:w-auto">Salvar O.S.</button>
          </>
        }
      >
        <form id="form-os" onSubmit={handleSave} className="space-y-5">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
          )}

          <fieldset className="p-3 sm:p-4 border border-slate-200 rounded-xl">
            <legend className="px-2 text-xs font-bold text-blue-600 uppercase">Agendamento</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <SearchCombobox
                id="os-tecnico"
                label="Técnico"
                value={formData.IDFUN}
                selectedLabel={tecnicoLabel}
                fetchOptions={fetchTecnicosCb}
                onChange={(v, opt) => {
                  setFormData((prev) => ({ ...prev, IDFUN: v || '' }));
                  setTecnicoLabel(opt?.label || '');
                }}
                createLabel="Novo técnico"
                createFields={[
                  { name: 'NOME', label: 'Nome', required: true },
                  { name: 'CELULAR', label: 'Celular' },
                  { name: 'FONE', label: 'Telefone' },
                ]}
                onCreate={async (form) => {
                  const opt = await createTecnicoQuick(form);
                  setFormData((prev) => ({ ...prev, IDFUN: opt.value }));
                  setTecnicoLabel(opt.label);
                  return opt;
                }}
                placeholder="Buscar técnico..."
              />
              <div>
                <label className="field-label">Data agendada</label>
                <input type="date" className="field-input" value={formData.DT_SADA} onChange={set('DT_SADA')} />
              </div>
              <div>
                <label className="field-label">Hora</label>
                <input type="time" className="field-input" value={formData.HR_SADA} onChange={set('HR_SADA')} />
              </div>
              <div>
                <label className="field-label">Duração</label>
                <select className="field-input" value={formData.HR_SERV} onChange={set('HR_SERV')}>
                  <option value="">Selecione...</option>
                  <option value="00:30">00:30</option>
                  <option value="01:00">01:00</option>
                  <option value="01:30">01:30</option>
                  <option value="02:00">02:00</option>
                </select>
              </div>
              <div>
                <label className="field-label">Status</label>
                <select className="field-input" value={formData.IN_STATUS} onChange={set('IN_STATUS')}>
                  <option value="Aguardando Atendimento">Aguardando Atendimento</option>
                  <option value="Em atendimento">Em atendimento</option>
                  <option value="Aguardando Peça">Aguardando Peça</option>
                  <option value="Aberto">Aberto</option>
                  <option value="Cancelado">Cancelado</option>
                  <option value="Encerrado">Encerrado</option>
                </select>
              </div>
              <div>
                <label className="field-label">Situação</label>
                <select className="field-input" value={formData.TIPO} onChange={set('TIPO')}>
                  <option value="Garantia">Garantia</option>
                  <option value="Sem Garantia">Fora da Garantia</option>
                  <option value="Nossa Garantia">Nossa Garantia</option>
                </select>
              </div>
            </div>
          </fieldset>

          <fieldset className="p-3 sm:p-4 border border-slate-200 rounded-xl">
            <legend className="px-2 text-xs font-bold text-blue-600 uppercase">Cliente e Equipamento</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <SearchCombobox
                id="os-cliente"
                label="Cliente"
                required
                value={formData.IDCLI}
                selectedLabel={clienteLabel}
                fetchOptions={fetchClientesCb}
                onChange={(v, opt) => {
                  setFormData((prev) => ({
                    ...prev,
                    IDCLI: v || '',
                    CD_EQPM: '',
                    EQUIPAMENTO: '',
                  }));
                  setClienteLabel(opt?.label || '');
                  setEquipLabel('');
                }}
                createLabel="Novo cliente"
                createFields={[
                  { name: 'NOME', label: 'Nome', required: true },
                  { name: 'TELEFONE', label: 'Telefone' },
                  { name: 'CELULAR', label: 'Celular' },
                  { name: 'EMAIL', label: 'E-mail', type: 'email' },
                  { name: 'MUNICIPIO', label: 'Município' },
                ]}
                onCreate={async (form) => {
                  const opt = await createClienteQuick(form);
                  setFormData((prev) => ({ ...prev, IDCLI: opt.value, CD_EQPM: '', EQUIPAMENTO: '' }));
                  setClienteLabel(opt.label);
                  setEquipLabel('');
                  return opt;
                }}
                placeholder="Buscar cliente..."
              />
              <SearchCombobox
                id="os-equip"
                label="Equipamento"
                value={formData.CD_EQPM || formData.EQUIPAMENTO}
                selectedLabel={equipLabel || formData.EQUIPAMENTO}
                fetchOptions={fetchEquipCb}
                disabled={!formData.IDCLI}
                placeholder={formData.IDCLI ? 'Buscar equipamento do cliente...' : 'Selecione o cliente primeiro'}
                emptyText={formData.IDCLI ? 'Nenhum equipamento' : 'Selecione o cliente'}
                onChange={(v, opt) => {
                  const desc = opt?.raw?.DS_EQPM || opt?.label || '';
                  setFormData((prev) => ({
                    ...prev,
                    CD_EQPM: v || '',
                    EQUIPAMENTO: desc,
                    DEFEITO: prev.DEFEITO || opt?.raw?.DEFEITO || '',
                  }));
                  setEquipLabel(desc);
                }}
                createLabel="Novo equipamento"
                createFields={[
                  { name: 'DS_EQPM', label: 'Descrição', required: true },
                  { name: 'NM_MARC', label: 'Marca' },
                  { name: 'DS_MODL', label: 'Modelo' },
                  { name: 'DS_SERI', label: 'Nº série' },
                ]}
                onCreate={formData.IDCLI ? async (form) => {
                  const opt = await createEquipamentoQuick(formData.IDCLI, form);
                  setFormData((prev) => ({
                    ...prev,
                    CD_EQPM: opt.value,
                    EQUIPAMENTO: opt.label,
                  }));
                  setEquipLabel(opt.label);
                  return opt;
                } : null}
              />
              <div className="sm:col-span-2">
                <label className="field-label">Descrição / garantia (texto OS)</label>
                <input
                  className="field-input"
                  value={formData.EQUIPAMENTO}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, EQUIPAMENTO: e.target.value }));
                    setEquipLabel(e.target.value);
                  }}
                  placeholder="Preenchido pelo equipamento ou digite manualmente"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="field-label">Defeito</label>
                <input required className="field-input" value={formData.DEFEITO} onChange={set('DEFEITO')} />
              </div>
            </div>
          </fieldset>

          <fieldset className="p-3 sm:p-4 border border-slate-200 rounded-xl">
            <legend className="px-2 text-xs font-bold text-blue-600 uppercase">Peças e Produtos</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <SearchCombobox
                id="os-peca"
                label="Peça"
                value={pendingPeca?.value}
                selectedLabel={pecaLabel}
                fetchOptions={fetchPecasCb}
                onChange={(v, opt) => {
                  setPendingPeca(opt);
                  setPecaLabel(opt?.label || '');
                }}
                createLabel="Nova peça"
                createFields={[
                  { name: 'DESCRICAO', label: 'Descrição', required: true },
                  { name: 'UNIDADE', label: 'Unidade', defaultValue: 'UN' },
                  { name: 'VENDA', label: 'Valor unitário', type: 'number' },
                ]}
                onCreate={async (form) => {
                  const opt = await createProdutoQuick(form, 'peca');
                  setPendingPeca(opt);
                  setPecaLabel(opt.label);
                  return opt;
                }}
                placeholder="Buscar peça..."
              />
              <SearchCombobox
                id="os-produto"
                label="Produto"
                value={pendingProduto?.value}
                selectedLabel={produtoLabel}
                fetchOptions={fetchProdutosCb}
                onChange={(v, opt) => {
                  setPendingProduto(opt);
                  setProdutoLabel(opt?.label || '');
                }}
                createLabel="Novo produto"
                createFields={[
                  { name: 'DESCRICAO', label: 'Descrição', required: true },
                  { name: 'UNIDADE', label: 'Unidade', defaultValue: 'UN' },
                  { name: 'VENDA', label: 'Valor unitário', type: 'number' },
                ]}
                onCreate={async (form) => {
                  const opt = await createProdutoQuick(form, 'produto');
                  setPendingProduto(opt);
                  setProdutoLabel(opt.label);
                  return opt;
                }}
                placeholder="Buscar produto..."
              />
              <div>
                <label className="field-label">Quantidade</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  className="field-input"
                  value={itemQtde}
                  onChange={(e) => setItemQtde(e.target.value)}
                />
              </div>
              <div className="flex items-end gap-2">
                <button
                  type="button"
                  className="btn-secondary flex-1"
                  disabled={!pendingPeca || savingItem}
                  onClick={() => addItemFromOption(pendingPeca, 'peca')}
                >
                  {savingItem ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                  Add peça
                </button>
                <button
                  type="button"
                  className="btn-secondary flex-1"
                  disabled={!pendingProduto || savingItem}
                  onClick={() => addItemFromOption(pendingProduto, 'produto')}
                >
                  {savingItem ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                  Add produto
                </button>
              </div>
            </div>

            {loadingItens ? (
              <div className="flex justify-center p-6"><Loader2 className="animate-spin text-blue-500" size={24} /></div>
            ) : (
              <>
                <div className="cards-mobile space-y-2">
                  {visibleItens.length === 0 && <p className="text-xs text-slate-500 text-center py-2">Nenhum item lançado.</p>}
                  {visibleItens.map((item) => (
                    <div key={`${item.IDPRO}-${item.DESCRICAO}`} className="bg-slate-50 rounded-lg p-3 text-sm flex justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800">{item.DESCRICAO}</p>
                        <p className="text-slate-500 text-xs mt-1">
                          Cód. {item.IDPRO} · Qtde {item.QTDE} · R$ {Number(item.VAL_TOT || 0).toFixed(2)}
                        </p>
                      </div>
                      <button type="button" className="btn-icon text-red-600" onClick={() => removeItem(item.IDPRO)} aria-label="Remover">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="table-desktop overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600 border-b">
                      <tr>
                        <th className="p-3">Código</th>
                        <th className="p-3">Descrição</th>
                        <th className="p-3 text-right">Qtde</th>
                        <th className="p-3 text-right">Total</th>
                        <th className="p-3 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleItens.length === 0 && <tr><td colSpan="5" className="p-4 text-center text-slate-500 text-xs">Nenhum item.</td></tr>}
                      {visibleItens.map((item) => (
                        <tr key={`${item.IDPRO}-${item.DESCRICAO}`} className="border-b border-slate-100">
                          <td className="p-3 font-mono">{item.IDPRO}</td>
                          <td className="p-3">{item.DESCRICAO}</td>
                          <td className="p-3 text-right">{item.QTDE}</td>
                          <td className="p-3 text-right font-bold text-blue-700">R$ {Number(item.VAL_TOT || 0).toFixed(2)}</td>
                          <td className="p-3 text-right">
                            <button type="button" className="btn-icon text-red-600" onClick={() => removeItem(item.IDPRO)} aria-label="Remover">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </fieldset>

          <fieldset className="p-3 sm:p-4 border border-slate-200 rounded-xl">
            <legend className="px-2 text-xs font-bold text-blue-600 uppercase">Totais</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="field-label">Valor Serviço</label>
                <input type="number" inputMode="decimal" step="0.01" className="field-input text-right font-mono" value={formData.VAL_SER} onChange={(e) => { setFormData({ ...formData, VAL_SER: e.target.value }); calculateTotal(e.target.value, formData.VAL_PRO, formData.VAL_DES); }} />
              </div>
              <div>
                <label className="field-label">Valor Produto</label>
                <input type="number" inputMode="decimal" step="0.01" className="field-input text-right font-mono" value={formData.VAL_PRO} onChange={(e) => { setFormData({ ...formData, VAL_PRO: e.target.value }); calculateTotal(formData.VAL_SER, e.target.value, formData.VAL_DES); }} />
              </div>
              <div>
                <label className="field-label">Desconto</label>
                <input type="number" inputMode="decimal" step="0.01" className="field-input text-right font-mono" value={formData.VAL_DES} onChange={(e) => { setFormData({ ...formData, VAL_DES: e.target.value }); calculateTotal(formData.VAL_SER, formData.VAL_PRO, e.target.value); }} />
              </div>
              <div>
                <label className="field-label text-blue-600">Total</label>
                <input type="number" readOnly className="field-input text-right font-mono font-bold text-blue-700 bg-blue-50 border-blue-200" value={formData.VAL_TOT} />
              </div>
              <div className="sm:col-span-2">
                <label className="field-label">Observações</label>
                <textarea rows="3" className="field-input" value={formData.SERVICO} onChange={set('SERVICO')} />
              </div>
            </div>
          </fieldset>
        </form>
      </Modal>
    </div>
  );
}
