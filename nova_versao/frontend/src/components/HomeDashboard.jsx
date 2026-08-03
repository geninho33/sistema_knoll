import { useEffect, useMemo, useState } from 'react';
import {
  Wrench, PlayCircle, CheckCircle2, Wallet, Loader2,
  Calendar, ChevronLeft, ChevronRight, MapPin, Users, BarChart3,
} from 'lucide-react';
import { apiFetch } from '../utils/api';
import { formatMoney } from '../utils/money';

const WEEKDAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const MONTH_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function parseLocalDate(iso) {
  if (!iso) return null;
  const s = String(iso).slice(0, 10);
  const [y, m, d] = s.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function formatShort(iso) {
  const d = parseLocalDate(iso);
  if (!d) return '';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function monthLabel(periodo) {
  const [y, m] = String(periodo).split('-');
  const idx = Number(m) - 1;
  return `${MONTH_LABELS[idx] || m}/${String(y).slice(2)}`;
}

function statusTone(status) {
  const s = String(status || '');
  if (s.includes('Encerrado') || s.includes('Concluído')) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  if (s.includes('Aguardando')) return 'bg-amber-100 text-amber-800 border-amber-200';
  if (s.includes('atendimento') || s.includes('Atendimento')) return 'bg-sky-100 text-sky-800 border-sky-200';
  if (s.includes('Aberto')) return 'bg-blue-100 text-blue-800 border-blue-200';
  return 'bg-slate-100 text-slate-700 border-slate-200';
}

function BarChart({ data, labelKey, valueKey, color = '#2563eb', height = 180 }) {
  const max = Math.max(1, ...data.map((d) => Number(d[valueKey]) || 0));
  return (
    <div className="w-full" style={{ height }}>
      <div className="flex items-end gap-1.5 h-full pb-6 relative">
        {data.map((d) => {
          const v = Number(d[valueKey]) || 0;
          const h = Math.max(v > 0 ? 8 : 2, Math.round((v / max) * 100));
          return (
            <div key={d[labelKey]} className="flex-1 flex flex-col items-center justify-end h-full min-w-0 group relative">
              <span className="absolute -top-5 text-[10px] font-semibold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                {v}
              </span>
              <div
                className="w-full max-w-[36px] rounded-t-md transition-all"
                style={{ height: `${h}%`, background: color, opacity: v ? 1 : 0.25 }}
                title={`${d[labelKey]}: ${v}`}
              />
              <span className="absolute bottom-0 text-[10px] text-slate-500 truncate w-full text-center leading-none pt-1">
                {typeof d[labelKey] === 'string' && d[labelKey].includes('-')
                  ? monthLabel(d[labelKey])
                  : d[labelKey]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RankBars({ items, nameKey, valueKey, color = '#0f766e' }) {
  const max = Math.max(1, ...items.map((i) => Number(i[valueKey]) || 0));
  if (!items.length) {
    return <p className="text-sm text-slate-500 py-6 text-center">Sem dados no período.</p>;
  }
  return (
    <ul className="space-y-2.5">
      {items.map((item, idx) => {
        const v = Number(item[valueKey]) || 0;
        const pct = Math.round((v / max) * 100);
        return (
          <li key={`${item[nameKey]}-${idx}`}>
            <div className="flex items-center justify-between gap-2 text-sm mb-1">
              <span className="font-medium text-slate-800 truncate">
                <span className="text-slate-400 font-mono text-xs mr-1.5">{idx + 1}.</span>
                {item[nameKey]}
              </span>
              <span className="font-bold text-slate-700 tabular-nums shrink-0">{v}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function weekDays(inicio) {
  const start = parseLocalDate(inicio);
  if (!start) return [];
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return { iso, label: WEEKDAYS[i], date: d };
  });
}

export default function HomeDashboard({ onNavigate }) {
  const [kpis, setKpis] = useState(null);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const [k, o] = await Promise.all([
          apiFetch('/dashboard/kpis'),
          apiFetch('/dashboard/overview'),
        ]);
        if (!cancelled) {
          setKpis(k);
          setOverview(o);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Falha ao carregar painel');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const days = useMemo(() => {
    if (!overview?.semana?.inicio) return [];
    const base = weekDays(overview.semana.inicio);
    if (!weekOffset) return base;
    return base.map((d) => {
      const nd = new Date(d.date);
      nd.setDate(nd.getDate() + weekOffset * 7);
      const iso = `${nd.getFullYear()}-${String(nd.getMonth() + 1).padStart(2, '0')}-${String(nd.getDate()).padStart(2, '0')}`;
      return { iso, label: d.label, date: nd };
    });
  }, [overview, weekOffset]);

  // Quando o usuário navega semanas fora da atual, buscamos agenda sob demanda
  const [weekAgenda, setWeekAgenda] = useState(null);
  const [weekLoading, setWeekLoading] = useState(false);

  useEffect(() => {
    if (!days.length) return undefined;
    if (weekOffset === 0 && overview?.semana) {
      setWeekAgenda(overview.semana.itens || []);
      return undefined;
    }
    let cancelled = false;
    (async () => {
      setWeekLoading(true);
      try {
        const data = await apiFetch(`/dashboard/overview?week_start=${days[0].iso}`);
        if (!cancelled) setWeekAgenda(data.semana?.itens || []);
      } catch {
        if (!cancelled) setWeekAgenda([]);
      } finally {
        if (!cancelled) setWeekLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [weekOffset, days, overview]);

  const byDay = useMemo(() => {
    const map = {};
    days.forEach((d) => { map[d.iso] = []; });
    (weekAgenda || []).forEach((item) => {
      const key = String(item.DT_SADA || '').slice(0, 10);
      if (!map[key]) map[key] = [];
      map[key].push(item);
    });
    return map;
  }, [days, weekAgenda]);

  const kpiCards = [
    {
      key: 'os_abertas',
      label: 'O.S. Abertas',
      icon: Wrench,
      tone: 'bg-blue-50 text-blue-600',
      value: kpis?.os_abertas,
    },
    {
      key: 'os_andamento',
      label: 'Em andamento',
      icon: PlayCircle,
      tone: 'bg-amber-50 text-amber-600',
      value: kpis?.os_andamento,
    },
    {
      key: 'os_concluidas',
      label: 'Concluídas (mês)',
      icon: CheckCircle2,
      tone: 'bg-emerald-50 text-emerald-600',
      value: kpis?.os_concluidas,
    },
    {
      key: 'faturamento_mes',
      label: 'Faturamento estimado (mês)',
      icon: Wallet,
      tone: 'bg-violet-50 text-violet-600',
      value: kpis ? formatMoney(kpis.faturamento_mes) : null,
      isMoney: true,
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 text-slate-500 gap-2">
        <Loader2 className="animate-spin" size={22} /> Carregando painel...
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-surface p-6 text-center text-red-600">{error}</div>
    );
  }

  const hoje = overview?.semana?.hoje;
  const regioesChart = (overview?.regioes || []).map((r) => ({
    label: r.estado ? `${r.municipio}/${r.estado}` : r.municipio,
    total: r.total,
  }));

  return (
    <div className="animate-in fade-in duration-500 space-y-5 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Painel da Assistência</h2>
          <p className="text-sm text-slate-500">Visão operacional de O.S., agenda e desempenho</p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn-primary" onClick={() => onNavigate?.('agenda')}>
            <Calendar size={16} /> Agenda completa
          </button>
          <button type="button" className="btn-secondary" onClick={() => onNavigate?.('ordens')}>
            <Wrench size={16} /> Ordens
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.key} className="card-surface p-4 sm:p-5 flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${card.tone}`}>
                <Icon size={24} />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-slate-500 font-semibold mb-0.5 truncate">{card.label}</p>
                <h3 className={`font-black text-slate-800 ${card.isMoney ? 'text-lg sm:text-xl' : 'text-2xl sm:text-3xl'}`}>
                  {card.value ?? '—'}
                </h3>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5">
        <section className="card-surface p-4 sm:p-5 xl:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 size={18} className="text-blue-600" />
            <div>
              <h3 className="font-bold text-slate-800">Volume de atendimentos</h3>
              <p className="text-xs text-slate-500">Últimos 12 meses (aberturas de O.S.)</p>
            </div>
          </div>
          <BarChart
            data={(overview?.volume || []).map((v) => ({ periodo: v.periodo, total: v.total }))}
            labelKey="periodo"
            valueKey="total"
            color="#2563eb"
          />
        </section>

        <section className="card-surface p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <Users size={18} className="text-teal-700" />
            <div>
              <h3 className="font-bold text-slate-800">Técnicos mais ativos</h3>
              <p className="text-xs text-slate-500">Últimos 90 dias</p>
            </div>
          </div>
          <RankBars
            items={(overview?.tecnicos || []).map((t) => ({ nome: t.nome, total: t.total }))}
            nameKey="nome"
            valueKey="total"
            color="#0f766e"
          />
        </section>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5">
        <section className="card-surface p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={18} className="text-orange-600" />
            <div>
              <h3 className="font-bold text-slate-800">Regiões com mais serviços</h3>
              <p className="text-xs text-slate-500">Municípios — últimos 180 dias</p>
            </div>
          </div>
          <RankBars items={regioesChart} nameKey="label" valueKey="total" color="#ea580c" />
          {regioesChart.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-100">
              <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold mb-2">Mapa relativo</p>
              <div className="flex flex-wrap gap-1.5">
                {regioesChart.slice(0, 8).map((r) => {
                  const max = regioesChart[0]?.total || 1;
                  const size = 28 + Math.round((r.total / max) * 36);
                  return (
                    <span
                      key={r.label}
                      className="inline-flex items-center justify-center rounded-full bg-orange-100 text-orange-800 text-[10px] font-bold px-2 border border-orange-200"
                      style={{ width: size, height: size }}
                      title={`${r.label}: ${r.total}`}
                    >
                      {r.total}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        <section className="card-surface p-4 sm:p-5 xl:col-span-2">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <Calendar size={18} className="text-blue-600 shrink-0" />
              <div className="min-w-0">
                <h3 className="font-bold text-slate-800">Agenda semanal</h3>
                <p className="text-xs text-slate-500 truncate">
                  {days[0] ? `${formatShort(days[0].iso)} — ${formatShort(days[6]?.iso)}` : 'Semana atual'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                className="btn-icon text-slate-600 hover:bg-slate-100"
                aria-label="Semana anterior"
                onClick={() => setWeekOffset((o) => o - 1)}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                className="btn-ghost text-xs px-2"
                onClick={() => setWeekOffset(0)}
              >
                Hoje
              </button>
              <button
                type="button"
                className="btn-icon text-slate-600 hover:bg-slate-100"
                aria-label="Próxima semana"
                onClick={() => setWeekOffset((o) => o + 1)}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {weekLoading ? (
            <div className="flex justify-center py-10 text-slate-500 gap-2">
              <Loader2 className="animate-spin" size={18} /> Carregando agenda...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2">
              {days.map((day) => {
                const items = byDay[day.iso] || [];
                const isToday = day.iso === hoje;
                return (
                  <div
                    key={day.iso}
                    className={`rounded-xl border p-2 min-h-[120px] ${isToday ? 'border-blue-400 bg-blue-50/60' : 'border-slate-200 bg-white'}`}
                  >
                    <div className="flex items-baseline justify-between mb-1.5">
                      <span className={`text-xs font-bold ${isToday ? 'text-blue-700' : 'text-slate-600'}`}>{day.label}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{formatShort(day.iso)}</span>
                    </div>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {items.length === 0 && (
                        <p className="text-[11px] text-slate-400 text-center py-3">—</p>
                      )}
                      {items.map((os) => (
                        <button
                          key={os.IDSER}
                          type="button"
                          onClick={() => onNavigate?.('ordens')}
                          className={`w-full text-left rounded-lg border px-1.5 py-1 ${statusTone(os.IN_STATUS)} hover:opacity-90`}
                        >
                          <p className="text-[10px] font-mono font-bold">#{os.IDSER}{os.HR_SADA ? ` · ${String(os.HR_SADA).slice(0, 5)}` : ''}</p>
                          <p className="text-[11px] font-semibold truncate">{os.CLIENTE_NOME || `Cliente #${os.IDCLI}`}</p>
                          <p className="text-[10px] opacity-80 truncate">{os.TECNICO_NOME || 'Sem técnico'}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
