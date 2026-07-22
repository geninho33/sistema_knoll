import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

export function Pagination({ page, totalPages = 1, total, onPrev, onNext, loading }) {
  return (
    <div className="p-3 sm:p-4 border-t border-slate-200 flex items-center justify-between gap-3 bg-slate-50">
      <span className="text-sm text-slate-500 font-medium truncate">
        Pág. {page} / {totalPages || 1}
        {total != null && <span className="hidden sm:inline"> ({total})</span>}
      </span>
      <div className="flex gap-2 shrink-0">
        <button
          type="button"
          disabled={page <= 1 || loading}
          onClick={onPrev}
          className="btn-icon border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50"
          aria-label="Página anterior"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          disabled={page >= (totalPages || 1) || loading}
          onClick={onNext}
          className="btn-icon border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50"
          aria-label="Próxima página"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

export function LoadingBlock() {
  return (
    <div className="flex justify-center p-12 sm:p-20" role="status" aria-label="Carregando">
      <Loader2 className="animate-spin text-blue-500" size={36} />
    </div>
  );
}

export function EmptyState({ message = 'Nenhum registro encontrado.' }) {
  return (
    <div className="p-8 text-center text-slate-500 text-sm">{message}</div>
  );
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
      <div className="min-w-0">
        <h2 className="page-title">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>
      {actions && (
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {actions}
        </div>
      )}
    </div>
  );
}
