import { useState } from 'react';
import {
  Search, Eraser, Eye, Printer, FileSpreadsheet, FileText,
  Loader2, AlertCircle, ChevronDown, ChevronUp
} from 'lucide-react';
import { apiFetch, buildQuery } from '../../utils/api';
import { exportToExcel, exportToPdfPrint, buildTableHtml } from '../../utils/export';
import { Pagination, LoadingBlock, EmptyState, PageHeader } from '../ui/Pagination';

export default function ReportModule({
  title,
  endpoint,
  filtersConfig,
  getColumns,
  initialFilters = {},
}) {
  const [filters, setFilters] = useState({
    tipo: 'sintetico',
    ordenacao: filtersConfig.defaultOrder || 'codigo',
    ordem: 'asc',
    ...initialFilters,
  });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [generated, setGenerated] = useState(false);
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const setField = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));

  const primaryFields = filtersConfig.fields.slice(0, 2);
  const extraFields = filtersConfig.fields.slice(2);

  const clearFilters = () => {
    setFilters({
      tipo: 'sintetico',
      ordenacao: filtersConfig.defaultOrder || 'codigo',
      ordem: 'asc',
      ...Object.fromEntries(Object.keys(initialFilters).map((k) => [k, ''])),
    });
    setResult(null);
    setGenerated(false);
    setPage(1);
    setError('');
  };

  const generate = async (pageNum = 1, exportAll = false) => {
    setLoading(true);
    setError('');
    try {
      const params = { ...filters, page: pageNum, limit: 50 };
      if (exportAll) params.export = '1';
      const data = await apiFetch(`/relatorios/${endpoint}${buildQuery(params)}`);
      if (!exportAll) {
        setResult(data);
        setPage(pageNum);
        setGenerated(true);
      }
      return data;
    } catch (err) {
      setError(err.message || 'Erro ao gerar relatório');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const columns = getColumns(filters.tipo === 'detalhado');
  const mobileColumns = columns.slice(0, 4);

  const handleExportExcel = async () => {
    const data = await generate(1, true);
    if (!data) return;
    exportToExcel(`${endpoint}_${filters.tipo}`, columns, data.data || []);
  };

  const handlePrintPdf = async () => {
    const data = await generate(1, true);
    if (!data) return;
    const html = buildTableHtml(columns, data.data || []);
    exportToPdfPrint(data.meta?.titulo || title, data.meta, html);
  };

  const formatCell = (col, row) => {
    const val = typeof col.value === 'function' ? col.value(row) : row[col.key];
    if (val == null || val === '') return '-';
    return String(val);
  };

  const renderField = (field) => (
    <div key={field.name} className={field.span === 2 ? 'sm:col-span-2' : ''}>
      <label className="field-label" htmlFor={`f-${field.name}`}>{field.label}</label>
      {field.type === 'select' ? (
        <select
          id={`f-${field.name}`}
          value={filters[field.name] || ''}
          onChange={(e) => setField(field.name, e.target.value)}
          className="field-input"
        >
          {field.options.map((opt) => (
            <option key={String(opt.value)} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : (
        <input
          id={`f-${field.name}`}
          type={field.type || 'text'}
          inputMode={field.type === 'number' ? 'numeric' : undefined}
          value={filters[field.name] || ''}
          onChange={(e) => setField(field.name, e.target.value)}
          placeholder={field.placeholder || ''}
          className="field-input"
        />
      )}
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500 pb-6">
      <PageHeader title={title} subtitle="Filtros, visualização e exportação" />

      <div className="filter-panel mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {primaryFields.map(renderField)}
          {showMoreFilters && extraFields.map(renderField)}

          <div>
            <label className="field-label">Ordenação</label>
            <select
              value={filters.ordenacao}
              onChange={(e) => setField('ordenacao', e.target.value)}
              className="field-input"
            >
              {filtersConfig.orderOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">Tipo</label>
            <select
              value={filters.tipo}
              onChange={(e) => setField('tipo', e.target.value)}
              className="field-input"
            >
              <option value="sintetico">Sintético</option>
              <option value="detalhado">Detalhado</option>
            </select>
          </div>
        </div>

        {extraFields.length > 0 && (
          <button
            type="button"
            onClick={() => setShowMoreFilters((v) => !v)}
            className="btn-ghost mt-3 w-full sm:w-auto text-blue-700"
          >
            {showMoreFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            {showMoreFilters ? 'Menos filtros' : 'Mais filtros'}
          </button>
        )}

        <div className="action-bar-scroll no-scrollbar mt-4 pt-3 border-t border-slate-100">
          <button type="button" onClick={() => generate(1)} disabled={loading} className="btn-primary">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            Gerar
          </button>
          <button type="button" onClick={clearFilters} className="btn-secondary">
            <Eraser size={16} /> Limpar
          </button>
          <button type="button" onClick={() => generate(page)} disabled={!generated || loading} className="btn bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50">
            <Eye size={16} /> Ver
          </button>
          <button type="button" onClick={handlePrintPdf} disabled={loading} className="btn bg-slate-800 text-white hover:bg-slate-900 disabled:opacity-50">
            <Printer size={16} /> Imprimir
          </button>
          <button type="button" onClick={handlePrintPdf} disabled={loading} className="btn bg-rose-50 text-rose-700 hover:bg-rose-100 disabled:opacity-50">
            <FileText size={16} /> PDF
          </button>
          <button type="button" onClick={handleExportExcel} disabled={loading} className="btn bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50">
            <FileSpreadsheet size={16} /> Excel
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-2 text-sm" role="alert">
          <AlertCircle size={18} className="shrink-0 mt-0.5" /> {error}
        </div>
      )}

      {result && (
        <div className="card-surface overflow-hidden">
          <div className="p-3 sm:p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap gap-x-4 gap-y-1 text-xs sm:text-sm text-slate-600">
            <span><strong>Empresa:</strong> {result.meta?.empresa}</span>
            <span><strong>Emissão:</strong> {result.meta?.emitido_em ? new Date(result.meta.emitido_em).toLocaleString('pt-BR') : '-'}</span>
            <span><strong>Usuário:</strong> {result.meta?.usuario}</span>
            <span><strong>Total:</strong> {result.meta?.total}</span>
          </div>

          {loading ? (
            <LoadingBlock />
          ) : (
            <>
              <div className="cards-mobile p-3">
                {(!result.data || result.data.length === 0) && <EmptyState />}
                {result.data?.map((row, idx) => (
                  <article key={row.IDCLI || row.IDSER || row.IDPRO || idx} className="mobile-card">
                    {mobileColumns.map((c, i) => (
                      <div key={c.key || c.label} className={i === 0 ? '' : 'border-t border-slate-100 pt-2'}>
                        <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold">{c.label}</p>
                        <p className={`text-sm text-slate-800 ${i === 0 ? 'font-bold' : ''} break-words`}>
                          {c.render ? c.render(row) : formatCell(c, row)}
                        </p>
                      </div>
                    ))}
                    {columns.length > 4 && (
                      <details className="pt-1">
                        <summary className="text-xs text-blue-600 font-semibold cursor-pointer min-h-touch flex items-center">Mais detalhes</summary>
                        <div className="mt-2 space-y-2">
                          {columns.slice(4).map((c) => (
                            <div key={c.key || c.label}>
                              <p className="text-[11px] uppercase text-slate-400 font-semibold">{c.label}</p>
                              <p className="text-sm text-slate-700 break-words">{formatCell(c, row)}</p>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </article>
                ))}
              </div>

              <div className="table-desktop overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200 sticky top-0">
                    <tr>
                      {columns.map((c) => (
                        <th key={c.key || c.label} className="p-3 whitespace-nowrap">{c.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(!result.data || result.data.length === 0) && (
                      <tr><td colSpan={columns.length}><EmptyState /></td></tr>
                    )}
                    {result.data?.map((row, idx) => (
                      <tr key={row.IDCLI || row.IDSER || row.IDPRO || idx} className="border-b border-slate-100 hover:bg-slate-50 align-top">
                        {columns.map((c) => (
                          <td key={c.key || c.label} className="p-3 text-slate-700 whitespace-nowrap max-w-[280px] truncate">
                            {c.render ? c.render(row) : formatCell(c, row)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Pagination
                page={result.meta?.page || page}
                totalPages={result.meta?.totalPages}
                total={result.meta?.total}
                loading={loading}
                onPrev={() => generate(page - 1)}
                onNext={() => generate(page + 1)}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}
