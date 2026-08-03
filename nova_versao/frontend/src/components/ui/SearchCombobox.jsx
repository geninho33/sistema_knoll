import { useEffect, useId, useRef, useState } from 'react';
import { ChevronsUpDown, Loader2, Plus, Search, X } from 'lucide-react';
import Modal from './Modal';

/**
 * Combobox de pesquisa assíncrona com cadastro rápido opcional.
 *
 * options: [{ value, label, sublabel?, raw? }]
 * onChange(value, option|null)
 * fetchOptions(query) => Promise<option[]>
 * createFields?: [{ name, label, required?, placeholder? }]
 * onCreate?(formData) => Promise<option>  — se presente, mostra "Cadastrar novo"
 */
export default function SearchCombobox({
  id,
  label,
  value,
  selectedLabel = '',
  onChange,
  fetchOptions,
  placeholder = 'Digite para buscar...',
  required = false,
  disabled = false,
  allowClear = true,
  createLabel = 'Cadastrar novo',
  createFields = null,
  onCreate = null,
  emptyText = 'Nenhum resultado',
}) {
  const autoId = useId();
  const inputId = id || autoId;
  const rootRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [display, setDisplay] = useState(selectedLabel || '');
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({});
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    setDisplay(selectedLabel || (value ? String(value) : ''));
  }, [selectedLabel, value]);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    let cancelled = false;
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const rows = await fetchOptions(query.trim());
        if (!cancelled) setOptions(Array.isArray(rows) ? rows : []);
      } catch {
        if (!cancelled) setOptions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 280);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [open, query, fetchOptions]);

  const pick = (opt) => {
    onChange?.(opt.value, opt);
    setDisplay(opt.label || String(opt.value));
    setOpen(false);
    setQuery('');
  };

  const clear = () => {
    onChange?.(null, null);
    setDisplay('');
    setQuery('');
  };

  const openCreate = () => {
    const initial = {};
    (createFields || []).forEach((f) => {
      initial[f.name] = f.defaultValue ?? '';
    });
    setCreateForm(initial);
    setCreateError('');
    setCreateOpen(true);
    setOpen(false);
  };

  const submitCreate = async (e) => {
    e.preventDefault();
    if (!onCreate) return;
    setCreating(true);
    setCreateError('');
    try {
      const opt = await onCreate(createForm);
      if (opt) pick(opt);
      setCreateOpen(false);
    } catch (err) {
      setCreateError(err.message || 'Falha ao cadastrar');
    } finally {
      setCreating(false);
    }
  };

  const canCreate = typeof onCreate === 'function' && Array.isArray(createFields) && createFields.length > 0;

  return (
    <div ref={rootRef} className="relative">
      {label && (
        <label className="field-label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <div className="relative flex gap-1">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
          <input
            id={inputId}
            type="text"
            role="combobox"
            aria-expanded={open}
            aria-autocomplete="list"
            aria-controls={`${inputId}-list`}
            disabled={disabled}
            required={required && !value}
            className="field-input pl-9 pr-16"
            placeholder={placeholder}
            value={open ? query : display}
            onChange={(e) => {
              setQuery(e.target.value);
              if (!open) setOpen(true);
            }}
            onFocus={() => {
              setOpen(true);
              setQuery('');
            }}
            autoComplete="off"
          />
          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center">
            {allowClear && value != null && value !== '' && !disabled && (
              <button type="button" className="p-2 text-slate-400 hover:text-slate-700" onClick={clear} aria-label="Limpar">
                <X size={16} />
              </button>
            )}
            <button
              type="button"
              className="p-2 text-slate-400 hover:text-slate-700"
              disabled={disabled}
              onClick={() => setOpen((o) => !o)}
              aria-label="Abrir lista"
            >
              <ChevronsUpDown size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* valor oculto para validação HTML required */}
      {required && (
        <input type="hidden" value={value ?? ''} required readOnly tabIndex={-1} aria-hidden="true" />
      )}

      {open && (
        <div
          id={`${inputId}-list`}
          role="listbox"
          className="absolute z-40 mt-1 w-full max-h-60 overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg"
        >
          {loading && (
            <div className="flex items-center gap-2 px-3 py-3 text-sm text-slate-500">
              <Loader2 className="animate-spin" size={16} /> Buscando...
            </div>
          )}
          {!loading && options.length === 0 && (
            <div className="px-3 py-3 text-sm text-slate-500">{emptyText}</div>
          )}
          {!loading &&
            options.map((opt) => (
              <button
                key={String(opt.value)}
                type="button"
                role="option"
                className="w-full text-left px-3 py-2.5 hover:bg-blue-50 border-b border-slate-50 last:border-0"
                onClick={() => pick(opt)}
              >
                <span className="block text-sm font-semibold text-slate-800 truncate">{opt.label}</span>
                {(opt.sublabel || opt.value != null) && (
                  <span className="block text-xs text-slate-500 truncate">
                    {opt.sublabel || `#${opt.value}`}
                  </span>
                )}
              </button>
            ))}
          {canCreate && (
            <button
              type="button"
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 sticky bottom-0"
              onClick={openCreate}
            >
              <Plus size={16} /> {createLabel}
            </button>
          )}
        </div>
      )}

      {canCreate && (
        <Modal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          title={createLabel}
          size="sm"
          footer={
            <>
              <button type="button" className="btn-secondary w-full sm:w-auto" onClick={() => setCreateOpen(false)}>
                Cancelar
              </button>
              <button type="submit" form={`${inputId}-create`} className="btn-primary w-full sm:w-auto" disabled={creating}>
                {creating ? <Loader2 className="animate-spin" size={16} /> : null}
                Salvar
              </button>
            </>
          }
        >
          <form id={`${inputId}-create`} onSubmit={submitCreate} className="space-y-3">
            {createError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{createError}</p>
            )}
            {createFields.map((f) => (
              <div key={f.name}>
                <label className="field-label" htmlFor={`${inputId}-${f.name}`}>
                  {f.label}
                </label>
                {f.type === 'textarea' ? (
                  <textarea
                    id={`${inputId}-${f.name}`}
                    className="field-input"
                    rows={f.rows || 2}
                    required={f.required}
                    placeholder={f.placeholder || ''}
                    value={createForm[f.name] || ''}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, [f.name]: e.target.value }))}
                  />
                ) : (
                  <input
                    id={`${inputId}-${f.name}`}
                    type={f.type || 'text'}
                    className="field-input"
                    required={f.required}
                    placeholder={f.placeholder || ''}
                    value={createForm[f.name] || ''}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, [f.name]: e.target.value }))}
                  />
                )}
              </div>
            ))}
          </form>
        </Modal>
      )}
    </div>
  );
}
