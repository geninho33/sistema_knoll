import { useEffect, useState } from 'react';
import { Search, Eraser, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiFetch, buildQuery } from '../../utils/api';

export function AcessosModule() {
  const [filters, setFilters] = useState({
    usuario: '', data_ini: '', data_fim: '', ip: '', status: '',
  });
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ data: [], totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async (pageNum = 1) => {
    setLoading(true);
    setError('');
    try {
      const result = await apiFetch(`/admin/acessos${buildQuery({ ...filters, page: pageNum, limit: 20 })}`);
      setData(result);
      setPage(pageNum);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(1); }, []);

  const statusLabel = {
    sucesso: 'Sucesso',
    falha: 'Falha',
    fora_horario: 'Fora do horário',
  };

  const statusClass = {
    sucesso: 'bg-emerald-100 text-emerald-700',
    falha: 'bg-red-100 text-red-700',
    fora_horario: 'bg-amber-100 text-amber-700',
  };

  return (
    <div className="animate-in fade-in duration-500 pb-6">
      <h2 className="page-title mb-1">Consulta de Acessos</h2>
      <p className="text-sm text-slate-500 mb-4">Histórico de logins e tentativas de acesso</p>

      <div className="filter-panel mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <input placeholder="Usuário" value={filters.usuario} onChange={(e) => setFilters({ ...filters, usuario: e.target.value })} className="field-input" />
        <input type="date" value={filters.data_ini} onChange={(e) => setFilters({ ...filters, data_ini: e.target.value })} className="field-input" aria-label="Data inicial" />
        <input type="date" value={filters.data_fim} onChange={(e) => setFilters({ ...filters, data_fim: e.target.value })} className="field-input" aria-label="Data final" />
        <input placeholder="IP" value={filters.ip} onChange={(e) => setFilters({ ...filters, ip: e.target.value })} className="field-input" />
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="field-input">
          <option value="">Todos os status</option>
          <option value="sucesso">Sucesso</option>
          <option value="falha">Falha</option>
          <option value="fora_horario">Fora do horário</option>
        </select>
        <div className="sm:col-span-2 lg:col-span-5 flex flex-wrap gap-2">
          <button type="button" onClick={() => load(1)} className="btn-primary"><Search size={16} /> Pesquisar</button>
          <button type="button" onClick={() => { setFilters({ usuario: '', data_ini: '', data_fim: '', ip: '', status: '' }); setTimeout(() => load(1), 0); }} className="btn-secondary"><Eraser size={16} /> Limpar</button>
        </div>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm" role="alert">{error}</div>}

      <div className="card-surface overflow-hidden">
        {loading ? (
          <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-500" size={40} /></div>
        ) : (
          <>
            <div className="cards-mobile p-3">
              {data.data?.length === 0 && <p className="p-6 text-center text-slate-500 text-sm">Nenhum acesso encontrado.</p>}
              {data.data?.map((row) => (
                <article key={row.id} className="mobile-card">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="mobile-card-title truncate">{row.usuario_nome || row.login || '-'}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-bold shrink-0 ${statusClass[row.status] || 'bg-slate-100'}`}>
                      {statusLabel[row.status] || row.status}
                    </span>
                  </div>
                  <p className="mobile-card-meta">{row.data_hora ? new Date(row.data_hora).toLocaleString('pt-BR') : '-'}</p>
                  <p className="mobile-card-meta font-mono text-xs">{row.ip || '-'}</p>
                  <p className="mobile-card-meta truncate" title={row.navegador}>{row.navegador || '-'}</p>
                  {row.detalhes && <p className="text-xs text-slate-500">{row.detalhes}</p>}
                </article>
              ))}
            </div>

            <div className="table-desktop overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 border-b">
                  <tr>
                    <th className="p-4">Usuário</th>
                    <th className="p-4">Data/Hora</th>
                    <th className="p-4">IP</th>
                    <th className="p-4">Navegador</th>
                    <th className="p-4">Ação</th>
                    <th className="p-4">Resultado</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data?.map((row) => (
                    <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-4 font-semibold">{row.usuario_nome || row.login || '-'}</td>
                      <td className="p-4">{row.data_hora ? new Date(row.data_hora).toLocaleString('pt-BR') : '-'}</td>
                      <td className="p-4 font-mono text-xs">{row.ip || '-'}</td>
                      <td className="p-4 max-w-[240px] truncate text-slate-500" title={row.navegador}>{row.navegador || '-'}</td>
                      <td className="p-4">{row.acao}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${statusClass[row.status] || 'bg-slate-100'}`}>
                          {statusLabel[row.status] || row.status}
                        </span>
                        {row.detalhes && <p className="text-xs text-slate-500 mt-1">{row.detalhes}</p>}
                      </td>
                    </tr>
                  ))}
                  {data.data?.length === 0 && <tr><td colSpan="6" className="p-8 text-center text-slate-500">Nenhum acesso encontrado.</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="p-3 sm:p-4 border-t flex justify-between items-center bg-slate-50">
              <span className="text-sm text-slate-500">Pág. {data.page} / {data.totalPages}</span>
              <div className="flex gap-2">
                <button type="button" disabled={page <= 1} onClick={() => load(page - 1)} className="btn-icon border rounded bg-white disabled:opacity-50" aria-label="Anterior"><ChevronLeft size={16} /></button>
                <button type="button" disabled={page >= data.totalPages} onClick={() => load(page + 1)} className="btn-icon border rounded bg-white disabled:opacity-50" aria-label="Próxima"><ChevronRight size={16} /></button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function AuditoriaModule() {
  const [filters, setFilters] = useState({
    usuario: '', data_ini: '', data_fim: '', tabela: '', operacao: '',
  });
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ data: [], totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState('');

  const load = async (pageNum = 1) => {
    setLoading(true);
    setError('');
    try {
      const result = await apiFetch(`/admin/auditoria${buildQuery({ ...filters, page: pageNum, limit: 20 })}`);
      setData(result);
      setPage(pageNum);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(1); }, []);

  const parseJson = (v) => {
    if (!v) return null;
    if (typeof v === 'object') return v;
    try { return JSON.parse(v); } catch { return v; }
  };

  return (
    <div className="animate-in fade-in duration-500 pb-6">
      <h2 className="page-title mb-1">Auditoria</h2>
      <p className="text-sm text-slate-500 mb-4">Rastreabilidade de inclusões, alterações, exclusões e acessos</p>

      <div className="filter-panel mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <input placeholder="Usuário" value={filters.usuario} onChange={(e) => setFilters({ ...filters, usuario: e.target.value })} className="field-input" />
        <input type="date" value={filters.data_ini} onChange={(e) => setFilters({ ...filters, data_ini: e.target.value })} className="field-input" aria-label="Data inicial" />
        <input type="date" value={filters.data_fim} onChange={(e) => setFilters({ ...filters, data_fim: e.target.value })} className="field-input" aria-label="Data final" />
        <input placeholder="Tabela" value={filters.tabela} onChange={(e) => setFilters({ ...filters, tabela: e.target.value })} className="field-input" />
        <select value={filters.operacao} onChange={(e) => setFilters({ ...filters, operacao: e.target.value })} className="field-input">
          <option value="">Todas operações</option>
          {['INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'PERMISSAO', 'SENHA'].map((op) => (
            <option key={op} value={op}>{op}</option>
          ))}
        </select>
        <div className="sm:col-span-2 lg:col-span-5 flex flex-wrap gap-2">
          <button type="button" onClick={() => load(1)} className="btn-primary"><Search size={16} /> Pesquisar</button>
          <button type="button" onClick={() => { setFilters({ usuario: '', data_ini: '', data_fim: '', tabela: '', operacao: '' }); }} className="btn-secondary"><Eraser size={16} /> Limpar</button>
        </div>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm" role="alert">{error}</div>}

      <div className="card-surface overflow-hidden">
        {loading ? (
          <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-500" size={40} /></div>
        ) : (
          <>
            <div className="cards-mobile p-3">
              {data.data?.length === 0 && <p className="p-6 text-center text-slate-500 text-sm">Nenhum registro de auditoria.</p>}
              {data.data?.map((row) => (
                <article key={row.id} className="mobile-card">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <p className="text-xs text-slate-400">{row.data_hora ? new Date(row.data_hora).toLocaleString('pt-BR') : '-'}</p>
                      <h3 className="mobile-card-title truncate">{row.usuario_nome || '-'}</h3>
                    </div>
                    <span className="px-2 py-1 bg-slate-100 rounded text-xs font-bold shrink-0">{row.operacao}</span>
                  </div>
                  <p className="mobile-card-meta font-mono text-xs">{row.tabela || '-'} · #{row.registro_id || '-'}</p>
                  <p className="mobile-card-meta font-mono text-xs">{row.ip || '-'}</p>
                  <button type="button" onClick={() => setDetail(row)} className="text-blue-600 text-sm font-semibold min-h-touch">Ver detalhes</button>
                </article>
              ))}
            </div>

            <div className="table-desktop overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 border-b">
                  <tr>
                    <th className="p-4">Data/Hora</th>
                    <th className="p-4">Usuário</th>
                    <th className="p-4">Operação</th>
                    <th className="p-4">Tabela</th>
                    <th className="p-4">Registro</th>
                    <th className="p-4">IP</th>
                    <th className="p-4">Detalhes</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data?.map((row) => (
                    <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-4 whitespace-nowrap">{row.data_hora ? new Date(row.data_hora).toLocaleString('pt-BR') : '-'}</td>
                      <td className="p-4 font-semibold">{row.usuario_nome || '-'}</td>
                      <td className="p-4"><span className="px-2 py-1 bg-slate-100 rounded text-xs font-bold">{row.operacao}</span></td>
                      <td className="p-4 font-mono text-xs">{row.tabela || '-'}</td>
                      <td className="p-4">{row.registro_id || '-'}</td>
                      <td className="p-4 font-mono text-xs">{row.ip || '-'}</td>
                      <td className="p-4">
                        <button type="button" onClick={() => setDetail(row)} className="text-blue-600 hover:underline text-xs font-semibold">Ver</button>
                      </td>
                    </tr>
                  ))}
                  {data.data?.length === 0 && <tr><td colSpan="7" className="p-8 text-center text-slate-500">Nenhum registro de auditoria.</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="p-3 sm:p-4 border-t flex justify-between items-center bg-slate-50">
              <span className="text-sm text-slate-500">Pág. {data.page} / {data.totalPages}</span>
              <div className="flex gap-2">
                <button type="button" disabled={page <= 1} onClick={() => load(page - 1)} className="btn-icon border rounded bg-white disabled:opacity-50" aria-label="Anterior"><ChevronLeft size={16} /></button>
                <button type="button" disabled={page >= data.totalPages} onClick={() => load(page + 1)} className="btn-icon border rounded bg-white disabled:opacity-50" aria-label="Próxima"><ChevronRight size={16} /></button>
              </div>
            </div>
          </>
        )}
      </div>

      {detail && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4" onClick={() => setDetail(null)}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl max-w-2xl w-[95%] sm:w-full p-4 sm:p-6 shadow-2xl max-h-[92dvh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Detalhe da auditoria #{detail.id}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-4">
              <p><strong>Operação:</strong> {detail.operacao}</p>
              <p><strong>Tabela:</strong> {detail.tabela}</p>
              <p><strong>Registro:</strong> {detail.registro_id}</p>
              <p><strong>Usuário:</strong> {detail.usuario_nome}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Valores anteriores</p>
                <pre className="bg-slate-50 border rounded-lg p-3 text-xs overflow-auto max-h-48">{JSON.stringify(parseJson(detail.valores_anteriores), null, 2) || '-'}</pre>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Valores novos</p>
                <pre className="bg-slate-50 border rounded-lg p-3 text-xs overflow-auto max-h-48">{JSON.stringify(parseJson(detail.valores_novos), null, 2) || '-'}</pre>
              </div>
            </div>
            <div className="mt-4">
              <button type="button" onClick={() => setDetail(null)} className="btn-secondary w-full sm:w-auto">Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
