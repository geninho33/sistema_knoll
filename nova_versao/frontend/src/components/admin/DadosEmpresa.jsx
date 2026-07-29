import { useEffect, useRef, useState } from 'react';
import { Building2, ImagePlus, Loader2, Save, Upload, X } from 'lucide-react';
import { apiFetch, apiUpload } from '../../utils/api';

const EMPTY = {
  nm_empr: '',
  ds_razao: '',
  nu_cnpj: '',
  nu_ie: '',
  nu_cep: '',
  nm_logr: '',
  nu_logr: '',
  nm_barr: '',
  nm_munc: '',
  sg_estd: 'SC',
  nu_telf: '',
  nu_telf2: '',
  nu_fax: '',
  ds_email: '',
  ds_obs: '',
  logo_url: null,
};

const UFS = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
  'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
];

const ACCEPT = 'image/png,image/jpeg,image/jpg,image/webp,image/svg+xml';
const MAX_BYTES = 2 * 1024 * 1024;

function notifyEmpresa(data, onEmpresaChange) {
  onEmpresaChange?.(data);
  window.dispatchEvent(new CustomEvent('knoll:empresa-updated', { detail: data }));
}

export default function DadosEmpresa({ onEmpresaChange }) {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);
  const onChangeRef = useRef(onEmpresaChange);
  onChangeRef.current = onEmpresaChange;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const data = await apiFetch('/configuracao');
        if (cancelled) return;
        setForm({ ...EMPTY, ...data });
        setPreview(data.logo_url || null);
        notifyEmpresa(data, onChangeRef.current);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const pickFile = (f) => {
    setError('');
    setOk('');
    if (!f) return;
    if (f.size > MAX_BYTES) {
      setError('A imagem deve ter no máximo 2MB.');
      return;
    }
    const okType = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'].includes(f.type);
    if (!okType) {
      setError('Formato inválido. Use PNG, JPG, WEBP ou SVG.');
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    pickFile(e.dataTransfer.files?.[0]);
  };

  const saveForm = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setOk('');
    try {
      const res = await apiFetch('/configuracao', {
        method: 'PUT',
        body: JSON.stringify(form),
      });
      const data = res.data || res;
      setForm((f) => ({ ...f, ...data }));
      setOk('Dados da empresa salvos com sucesso.');
      notifyEmpresa(data, onChangeRef.current);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const saveLogo = async () => {
    if (!file) {
      setError('Selecione uma imagem antes de salvar o logotipo.');
      return;
    }
    setUploading(true);
    setError('');
    setOk('');
    try {
      const fd = new FormData();
      fd.append('logo', file);
      const res = await apiUpload('/configuracao/logo', fd);
      const data = res.data || res;
      setForm((f) => ({ ...f, ...data }));
      setPreview(data.logo_url || preview);
      setFile(null);
      setOk('Logotipo atualizado com sucesso.');
      notifyEmpresa(data, onChangeRef.current);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500 gap-2">
        <Loader2 className="animate-spin" size={22} /> Carregando configuração...
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-300 max-w-5xl space-y-6">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <Building2 size={24} />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">Dados da Empresa</h2>
          <p className="text-slate-500 text-sm mt-1">
            Cadastro usado no cabeçalho do sistema e nas impressões de Ordens de Serviço.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">{error}</div>
      )}
      {ok && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 px-4 py-3 text-sm">{ok}</div>
      )}

      <section className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6">
        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <ImagePlus size={18} /> Logotipo
        </h3>
        <div className="grid sm:grid-cols-[160px_1fr] gap-4 items-start">
          <div className="w-40 h-40 border border-slate-200 rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden">
            {preview ? (
              <img src={preview} alt="Logo da empresa" className="max-w-full max-h-full object-contain" />
            ) : (
              <span className="text-xs text-slate-400 text-center px-2">Sem logo</span>
            )}
          </div>
          <div>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              className={`border-2 border-dashed rounded-xl p-5 text-center transition-colors ${
                dragOver ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-slate-50/50'
              }`}
            >
              <Upload className="mx-auto text-slate-400 mb-2" size={22} />
              <p className="text-sm text-slate-600 mb-2">Arraste a imagem ou selecione um arquivo</p>
              <p className="text-xs text-slate-400 mb-3">PNG, JPG, WEBP ou SVG · até 2MB</p>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => inputRef.current?.click()}
              >
                Selecionar imagem
              </button>
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPT}
                className="hidden"
                onChange={(e) => pickFile(e.target.files?.[0])}
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" className="btn-primary" disabled={uploading || !file} onClick={saveLogo}>
                {uploading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                Salvar logotipo
              </button>
              {file && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setFile(null);
                    setPreview(form.logo_url || null);
                  }}
                >
                  <X size={16} /> Cancelar seleção
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <form onSubmit={saveForm} className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 space-y-4">
        <h3 className="font-semibold text-slate-800">Dados cadastrais</h3>

        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block text-sm">
            <span className="text-slate-600 font-medium">Nome Fantasia</span>
            <input className="field-input mt-1" value={form.nm_empr || ''} onChange={(e) => setField('nm_empr', e.target.value)} />
          </label>
          <label className="block text-sm">
            <span className="text-slate-600 font-medium">Razão Social</span>
            <input className="field-input mt-1" value={form.ds_razao || ''} onChange={(e) => setField('ds_razao', e.target.value)} />
          </label>
          <label className="block text-sm">
            <span className="text-slate-600 font-medium">CNPJ</span>
            <input className="field-input mt-1" value={form.nu_cnpj || ''} onChange={(e) => setField('nu_cnpj', e.target.value)} />
          </label>
          <label className="block text-sm">
            <span className="text-slate-600 font-medium">Inscrição Estadual</span>
            <input className="field-input mt-1" value={form.nu_ie || ''} onChange={(e) => setField('nu_ie', e.target.value)} />
          </label>
          <label className="block text-sm">
            <span className="text-slate-600 font-medium">Telefone</span>
            <input className="field-input mt-1" value={form.nu_telf || ''} onChange={(e) => setField('nu_telf', e.target.value)} />
          </label>
          <label className="block text-sm">
            <span className="text-slate-600 font-medium">Telefone 2</span>
            <input className="field-input mt-1" value={form.nu_telf2 || ''} onChange={(e) => setField('nu_telf2', e.target.value)} />
          </label>
          <label className="block text-sm">
            <span className="text-slate-600 font-medium">Fax</span>
            <input className="field-input mt-1" value={form.nu_fax || ''} onChange={(e) => setField('nu_fax', e.target.value)} />
          </label>
          <label className="block text-sm">
            <span className="text-slate-600 font-medium">E-mail</span>
            <input type="email" className="field-input mt-1" value={form.ds_email || ''} onChange={(e) => setField('ds_email', e.target.value)} />
          </label>
        </div>

        <div className="grid sm:grid-cols-6 gap-4">
          <label className="block text-sm sm:col-span-2">
            <span className="text-slate-600 font-medium">CEP</span>
            <input className="field-input mt-1" value={form.nu_cep || ''} onChange={(e) => setField('nu_cep', e.target.value)} />
          </label>
          <label className="block text-sm sm:col-span-3">
            <span className="text-slate-600 font-medium">Logradouro</span>
            <input className="field-input mt-1" value={form.nm_logr || ''} onChange={(e) => setField('nm_logr', e.target.value)} />
          </label>
          <label className="block text-sm sm:col-span-1">
            <span className="text-slate-600 font-medium">Nº</span>
            <input className="field-input mt-1" value={form.nu_logr || ''} onChange={(e) => setField('nu_logr', e.target.value)} />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="text-slate-600 font-medium">Bairro</span>
            <input className="field-input mt-1" value={form.nm_barr || ''} onChange={(e) => setField('nm_barr', e.target.value)} />
          </label>
          <label className="block text-sm sm:col-span-3">
            <span className="text-slate-600 font-medium">Cidade</span>
            <input className="field-input mt-1" value={form.nm_munc || ''} onChange={(e) => setField('nm_munc', e.target.value)} />
          </label>
          <label className="block text-sm sm:col-span-1">
            <span className="text-slate-600 font-medium">UF</span>
            <select className="field-input mt-1" value={form.sg_estd || ''} onChange={(e) => setField('sg_estd', e.target.value)}>
              <option value="">—</option>
              {UFS.map((uf) => (
                <option key={uf} value={uf}>{uf}</option>
              ))}
            </select>
          </label>
        </div>

        <label className="block text-sm">
          <span className="text-slate-600 font-medium">Observações / Termos</span>
          <textarea
            className="field-input mt-1 min-h-[100px]"
            value={form.ds_obs || ''}
            onChange={(e) => setField('ds_obs', e.target.value)}
          />
        </label>

        <div className="pt-2">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            Salvar Alterações
          </button>
        </div>
      </form>
    </div>
  );
}
