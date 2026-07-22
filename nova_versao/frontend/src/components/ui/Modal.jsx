import { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Modal responsivo mobile-first
 * - 95% largura no mobile
 * - scroll interno
 * - ações fixas no rodapé
 * - fecha com Escape / clique no overlay
 */
export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'lg',
}) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const maxW = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-5xl',
  }[size] || 'max-w-4xl';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={typeof title === 'string' ? title : 'Dialog'}
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        aria-label="Fechar"
        onClick={onClose}
      />

      <div
        className={`relative bg-white w-[95%] sm:w-full ${maxW} max-h-[92dvh] sm:max-h-[90vh] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200`}
      >
        <div className="flex items-start justify-between gap-3 p-4 sm:p-5 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="min-w-0 flex-1">
            {typeof title === 'string' ? (
              <h3 className="text-lg sm:text-xl font-bold text-slate-800 leading-snug pr-2">{title}</h3>
            ) : (
              title
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-icon text-slate-400 hover:text-red-500 hover:bg-red-50 shrink-0"
            aria-label="Fechar modal"
          >
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5">
          {children}
        </div>

        {footer && (
          <div className="sticky-actions safe-pb shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
