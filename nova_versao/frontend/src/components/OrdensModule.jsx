import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Loader2 } from 'lucide-react';
import Modal from './ui/Modal';
import { Pagination, LoadingBlock, EmptyState, PageHeader } from './ui/Pagination';

export default function OrdensModule() {
  const [data, setData] = useState({ data: [], totalPages: 1, page: 1, total: 0 });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOrdem, setEditingOrdem] = useState(null);
  const [itensOs, setItensOs] = useState([]);
  const [loadingItens, setLoadingItens] = useState(false);

  const getInitialForm = () => ({
    IDCLI: '', EQUIPAMENTO: '', DEFEITO: '', IN_STATUS: 'Aberto',
    DT_SADA: '', HR_SADA: '', HR_SERV: '', IDFUN: 1, TIPO: 'Garantia',
    VAL_SER: 0, VAL_PRO: 0, VAL_DES: 0, VAL_TOT: 0, SERVICO: '',
  });

  const [formData, setFormData] = useState(getInitialForm());

  const fetchOrdens = async (pageNum, query) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/api/ordens?page=${pageNum}&limit=10&q=${query}`);
      const result = await res.json();
      setData(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchItens = async (idser) => {
    setLoadingItens(true);
    try {
      const res = await fetch(`http://localhost:3001/api/ordens/${idser}/itens`);
      setItensOs(await res.json());
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingItens(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => fetchOrdens(page, search), 400);
    return () => clearTimeout(delay);
  }, [page, search]);

  const handleSave = async (e) => {
    e.preventDefault();
    const isEdit = !!editingOrdem;
    const url = isEdit
      ? `http://localhost:3001/api/ordens/${editingOrdem.IDSER}`
      : 'http://localhost:3001/api/ordens';

    await fetch(url, {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    setModalOpen(false);
    fetchOrdens(page, search);
  };

  const openEdit = (ordem) => {
    setEditingOrdem(ordem);
    setFormData({
      IDCLI: ordem.IDCLI || '',
      EQUIPAMENTO: ordem.EQUIPAMENTO || '',
      DEFEITO: ordem.DEFEITO || '',
      IN_STATUS: ordem.IN_STATUS || 'Aberto',
      DT_SADA: ordem.DT_SADA && ordem.DT_SADA !== '0000-00-00 00:00:00' ? String(ordem.DT_SADA).split('T')[0] : '',
      HR_SADA: ordem.HR_SADA || '',
      HR_SERV: ordem.HR_SERV || '',
      IDFUN: ordem.IDFUN || 1,
      TIPO: ordem.TIPO || 'Garantia',
      VAL_SER: ordem.VAL_SER || 0,
      VAL_PRO: ordem.VAL_PRO || 0,
      VAL_DES: ordem.VAL_DES || 0,
      VAL_TOT: ordem.VAL_TOT || 0,
      SERVICO: ordem.SERVICO || '',
    });
    setItensOs([]);
    fetchItens(ordem.IDSER);
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

  return (
    <div className="animate-in fade-in duration-500 pb-6">
      <PageHeader
        title="Ordens de Serviço"
        subtitle="Gestão de atendimentos"
        actions={
          <button
            type="button"
            onClick={() => { setEditingOrdem(null); setItensOs([]); setFormData(getInitialForm()); setModalOpen(true); }}
            className="btn-primary w-full sm:w-auto"
          >
            <Plus size={18} /> Nova Ordem
          </button>
        }
      />

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
                        <button type="button" onClick={() => openEdit(o)} className="btn-icon text-blue-600 bg-blue-50" aria-label="Editar">
                          <Edit2 size={16} />
                        </button>
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
            <button type="submit" form="form-os" className="btn-primary w-full sm:w-auto">Salvar O.S.</button>
          </>
        }
      >
        <form id="form-os" onSubmit={handleSave} className="space-y-5">
          <fieldset className="p-3 sm:p-4 border border-slate-200 rounded-xl">
            <legend className="px-2 text-xs font-bold text-blue-600 uppercase">Agendamento</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="field-label">Técnico (ID)</label>
                <input type="number" inputMode="numeric" className="field-input" value={formData.IDFUN} onChange={set('IDFUN')} />
              </div>
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
              <div>
                <label className="field-label">Cód. Cliente</label>
                <input type="number" inputMode="numeric" required className="field-input" value={formData.IDCLI} onChange={set('IDCLI')} />
              </div>
              <div>
                <label className="field-label">Equipamento</label>
                <input required className="field-input" value={formData.EQUIPAMENTO} onChange={set('EQUIPAMENTO')} />
              </div>
              <div className="sm:col-span-2">
                <label className="field-label">Defeito</label>
                <input required className="field-input" value={formData.DEFEITO} onChange={set('DEFEITO')} />
              </div>
            </div>
          </fieldset>

          {editingOrdem && (
            <fieldset className="border border-slate-200 rounded-xl overflow-hidden">
              <legend className="ml-3 px-2 text-xs font-bold text-blue-600 uppercase bg-white">Peças / Itens</legend>
              {loadingItens ? (
                <div className="flex justify-center p-6"><Loader2 className="animate-spin text-blue-500" size={24} /></div>
              ) : (
                <>
                  <div className="cards-mobile p-3 space-y-2">
                    {itensOs.length === 0 && <p className="text-xs text-slate-500 text-center py-2">Nenhum item lançado.</p>}
                    {itensOs.map((item) => (
                      <div key={`${item.IDPRO}-${item.DESCRICAO}`} className="bg-slate-50 rounded-lg p-3 text-sm">
                        <p className="font-semibold text-slate-800">{item.DESCRICAO}</p>
                        <p className="text-slate-500 text-xs mt-1">Cód. {item.IDPRO} · Qtde {item.QTDE} · R$ {Number(item.VAL_TOT || 0).toFixed(2)}</p>
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
                        </tr>
                      </thead>
                      <tbody>
                        {itensOs.length === 0 && <tr><td colSpan="4" className="p-4 text-center text-slate-500 text-xs">Nenhum item.</td></tr>}
                        {itensOs.map((item) => (
                          <tr key={`${item.IDPRO}-${item.DESCRICAO}`} className="border-b border-slate-100">
                            <td className="p-3 font-mono">{item.IDPRO}</td>
                            <td className="p-3">{item.DESCRICAO}</td>
                            <td className="p-3 text-right">{item.QTDE}</td>
                            <td className="p-3 text-right font-bold text-blue-700">R$ {Number(item.VAL_TOT || 0).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </fieldset>
          )}

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
