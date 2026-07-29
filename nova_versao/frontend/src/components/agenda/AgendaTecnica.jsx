import { useEffect, useMemo, useState } from 'react';
import {
  Wrench, UserRound, CalendarDays, Printer, Loader2, UserPlus, ChevronLeft, MapPin
} from 'lucide-react';
import { apiFetch, buildQuery } from '../../utils/api';
import {
  buildAddress, formatDateBR, formatDateInput, printHtml, statusColor
} from '../../utils/agenda';

function ViewSwitcher({ view, setView }) {
  return (
    <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
      {[
        { id: 'dia', label: 'Dia' },
        { id: 'mes', label: 'Mês' },
        { id: 'ano', label: 'Ano' },
      ].map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => setView(item.id)}
          className={`min-h-[40px] px-3 sm:px-4 rounded-lg text-sm font-semibold ${view === item.id ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-white'}`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function OsCard({ os, tecnicos, onAssign, compact }) {
  const [tecnicoId, setTecnicoId] = useState(os.IDFUN || '');

  return (
    <article className="mobile-card">
      <div className="flex justify-between gap-2 items-start">
        <div className="min-w-0">
          <p className="font-mono text-xs text-blue-600 font-bold">OS #{os.IDSER}</p>
          <h3 className="mobile-card-title truncate">{os.CLIENTE_NOME || `Cliente #${os.IDCLI}`}</h3>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-bold shrink-0 ${statusColor(os.IN_STATUS)}`}>
          {os.IN_STATUS || 'S/ STATUS'}
        </span>
      </div>
      <p className="mobile-card-meta">
        <CalendarDays size={14} className="inline mr-1" />
        {formatDateBR(os.DT_SADA)} {os.HR_SADA ? `às ${os.HR_SADA}` : ''}
      </p>
      {!compact && (
        <p className="mobile-card-meta truncate">
          <MapPin size={14} className="inline mr-1" />
          {buildAddress(os) || 'Endereço não informado'}
        </p>
      )}
      <p className="mobile-card-meta truncate">{os.EQUIPAMENTO_NOME || os.EQUIPAMENTO || os.DEFEITO || '-'}</p>
      <p className="mobile-card-meta">Técnico: <strong>{os.TECNICO_NOME || 'Não atribuído'}</strong></p>

      {onAssign && (
        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <select
            className="field-input"
            value={tecnicoId || ''}
            onChange={(e) => setTecnicoId(e.target.value)}
          >
            <option value="">Selecionar técnico...</option>
            {tecnicos.map((t) => (
              <option key={t.IDFUN} value={t.IDFUN}>{t.NOME}</option>
            ))}
          </select>
          <button
            type="button"
            className="btn-primary w-full sm:w-auto"
            disabled={!tecnicoId}
            onClick={() => onAssign(os.IDSER, Number(tecnicoId))}
          >
            <UserPlus size={16} /> Atribuir
          </button>
        </div>
      )}
    </article>
  );
}

function VisaoTecnico({ tecnicos, onBack }) {
  const [tecnicoId, setTecnicoId] = useState(tecnicos[0]?.IDFUN || '');
  const [view, setView] = useState('dia');
  const [data, setData] = useState(formatDateInput());
  const [result, setResult] = useState({ data: [], tecnico: null });
  const [pendentes, setPendentes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    if (!tecnicoId) return;
    setLoading(true);
    setError('');
    try {
      const [agenda, pend] = await Promise.all([
        apiFetch(`/agenda/tecnico/${tecnicoId}${buildQuery({ view, data })}`),
        apiFetch('/agenda/pendentes'),
      ]);
      setResult(agenda);
      setPendentes(pend);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [tecnicoId, view, data]);

  const assign = async (idser, idfun) => {
    await apiFetch(`/agenda/atribuir/${idser}`, {
      method: 'PUT',
      body: JSON.stringify({ IDFUN: idfun, DT_SADA: data }),
    });
    load();
  };

  const printAgenda = () => {
    const rows = (result.data || [])
      .map((os) => `
        <tr>
          <td>${formatDateBR(os.DT_SADA)} ${os.HR_SADA || ''}</td>
          <td>#${os.IDSER}</td>
          <td>${os.CLIENTE_NOME || '-'}</td>
          <td>${buildAddress(os) || '-'}</td>
          <td>${os.IN_STATUS || '-'}</td>
        </tr>`)
      .join('');

    printHtml(`Agenda - ${result.tecnico?.NOME || 'Técnico'}`, `
      <div class="header">
        <div>
          <h1>Agenda do Técnico</h1>
          <h2>${result.tecnico?.NOME || '-'}</h2>
          <p class="muted">Período: ${result.periodo || '-'} | Visão: ${view}</p>
        </div>
        <div style="text-align:right">
          <p><strong>Emitido em</strong><br/>${new Date().toLocaleString('pt-BR')}</p>
        </div>
      </div>
      <table>
        <thead><tr><th>Data/Hora</th><th>OS</th><th>Cliente</th><th>Endereço</th><th>Status</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="5">Sem serviços no período.</td></tr>'}</tbody>
      </table>
    `);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button type="button" className="btn-secondary w-full sm:w-auto" onClick={onBack}>
          <ChevronLeft size={16} /> Voltar
        </button>
        <button type="button" className="btn-primary w-full sm:w-auto" onClick={printAgenda}>
          <Printer size={16} /> Imprimir Agenda do Técnico
        </button>
      </div>

      <div className="filter-panel grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-1">
          <label className="field-label">Técnico</label>
          <select className="field-input" value={tecnicoId} onChange={(e) => setTecnicoId(Number(e.target.value))}>
            {tecnicos.map((t) => <option key={t.IDFUN} value={t.IDFUN}>{t.NOME}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label">Data de referência</label>
          <input type="date" className="field-input" value={data} onChange={(e) => setData(e.target.value)} />
        </div>
        <div className="flex items-end">
          <ViewSwitcher view={view} setView={setView} />
        </div>
      </div>

      {error && <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm" role="alert">{error}</div>}

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-blue-500" size={36} /></div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <section className="xl:col-span-2 space-y-3">
            <h3 className="text-lg font-bold text-slate-800">
              Serviços de {result.tecnico?.NOME || 'técnico'} ({result.data?.length || 0})
            </h3>
            {(result.data || []).map((os) => <OsCard key={os.IDSER} os={os} tecnicos={tecnicos} />)}
            {(result.data || []).length === 0 && (
              <p className="text-sm text-slate-500 card-surface p-6 text-center">Nenhuma OS neste período.</p>
            )}
          </section>

          <aside className="space-y-3">
            <h3 className="text-lg font-bold text-slate-800">Serviços sem técnico</h3>
            {pendentes.slice(0, 30).map((os) => (
              <OsCard key={os.IDSER} os={os} tecnicos={tecnicos} onAssign={assign} compact />
            ))}
            {pendentes.length === 0 && (
              <p className="text-sm text-slate-500 card-surface p-4 text-center">Nenhuma pendência.</p>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}

function VisaoServico({ tecnicos, onBack }) {
  const [view, setView] = useState('dia');
  const [data, setData] = useState(formatDateInput());
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await apiFetch(`/agenda/servicos${buildQuery({ view, data })}`);
      setLista(result.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [view, data]);

  const assign = async (idser, idfun) => {
    await apiFetch(`/agenda/atribuir/${idser}`, {
      method: 'PUT',
      body: JSON.stringify({ IDFUN: idfun }),
    });
    load();
  };

  const semTecnico = useMemo(() => lista.filter((os) => !os.IDFUN), [lista]);

  return (
    <div className="space-y-4">
      <button type="button" className="btn-secondary w-full sm:w-auto" onClick={onBack}>
        <ChevronLeft size={16} /> Voltar
      </button>

      <div className="filter-panel grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="field-label">Data de referência</label>
          <input type="date" className="field-input" value={data} onChange={(e) => setData(e.target.value)} />
        </div>
        <div className="flex items-end">
          <ViewSwitcher view={view} setView={setView} />
        </div>
      </div>

      {error && <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm">{error}</div>}

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-blue-500" size={36} /></div>
      ) : (
        <>
          <p className="text-sm text-slate-500">
            {lista.length} serviço(s) no período · {semTecnico.length} sem técnico
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {lista.map((os) => (
              <OsCard
                key={os.IDSER}
                os={os}
                tecnicos={tecnicos}
                onAssign={!os.IDFUN ? assign : undefined}
              />
            ))}
            {lista.length === 0 && (
              <p className="text-sm text-slate-500 card-surface p-6 text-center md:col-span-2">
                Nenhum serviço programado neste período.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function AgendaTecnica() {
  const [mode, setMode] = useState(null);
  const [tecnicos, setTecnicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch('/agenda/tecnicos')
      .then(setTecnicos)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" size={40} /></div>;
  }

  if (error) {
    return <div className="p-4 bg-red-50 text-red-700 rounded-xl">{error}</div>;
  }

  if (mode === 'tecnico') {
    return <VisaoTecnico tecnicos={tecnicos} onBack={() => setMode(null)} />;
  }
  if (mode === 'servico') {
    return <VisaoServico tecnicos={tecnicos} onBack={() => setMode(null)} />;
  }

  return (
    <div className="animate-in fade-in duration-500 pb-6">
      <div className="mb-6">
        <h2 className="page-title">Agenda Técnica</h2>
        <p className="text-sm text-slate-500 mt-1">Escolha como deseja visualizar e organizar os atendimentos.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <button
          type="button"
          onClick={() => setMode('tecnico')}
          className="card-surface p-6 sm:p-8 text-left hover:border-blue-400 hover:shadow-md transition-all group min-h-[180px]"
        >
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <UserRound size={28} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Visão por Técnico</h3>
          <p className="text-sm text-slate-500">
            Selecione o profissional, navegue por dia/mês/ano e atribua serviços pendentes.
          </p>
        </button>

        <button
          type="button"
          onClick={() => setMode('servico')}
          className="card-surface p-6 sm:p-8 text-left hover:border-emerald-400 hover:shadow-md transition-all group min-h-[180px]"
        >
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <Wrench size={28} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Visão por Serviço</h3>
          <p className="text-sm text-slate-500">
            Veja todos os serviços da empresa no calendário e atribua técnicos rapidamente.
          </p>
        </button>
      </div>
    </div>
  );
}
