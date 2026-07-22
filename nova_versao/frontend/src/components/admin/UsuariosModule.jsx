import { useEffect, useState } from 'react';
import { Plus, Edit2, Loader2, Search, Trash2, X, Save } from 'lucide-react';
import { apiFetch } from '../../utils/api';

const DIAS = [
  { value: 0, label: 'Dom' },
  { value: 1, label: 'Seg' },
  { value: 2, label: 'Ter' },
  { value: 3, label: 'Qua' },
  { value: 4, label: 'Qui' },
  { value: 5, label: 'Sex' },
  { value: 6, label: 'Sáb' },
];

const emptyHorarios = () =>
  DIAS.map((d) => ({
    dia_semana: d.value,
    hora_inicio: '08:00',
    hora_fim: '18:00',
    ativo: d.value >= 1 && d.value <= 5,
  }));

const emptyForm = () => ({
  nome: '',
  login: '',
  email: '',
  senha: '',
  perfil_id: '',
  status: 'A',
  hr_matt_entr: '08:00',
  hr_matt_saida: '12:00',
  hr_vesp_entr: '13:00',
  hr_vesp_saida: '18:00',
  horarios: emptyHorarios(),
});

export default function UsuariosModule() {
  const [list, setList] = useState([]);
  const [perfis, setPerfis] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [users, profiles] = await Promise.all([
        apiFetch(`/admin/usuarios${q ? `?q=${encodeURIComponent(q)}` : ''}`),
        apiFetch('/admin/perfis'),
      ]);
      setList(users);
      setPerfis(profiles);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [q]);

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm());
    setError('');
    setModal(true);
  };

  const openEdit = async (row) => {
    setError('');
    try {
      const data = await apiFetch(`/admin/usuarios/${row.id}`);
      const horarios = emptyHorarios().map((h) => {
        const found = (data.horarios || []).find((x) => Number(x.dia_semana) === h.dia_semana);
        if (!found) return h;
        return {
          dia_semana: h.dia_semana,
          hora_inicio: String(found.hora_inicio).slice(0, 5),
          hora_fim: String(found.hora_fim).slice(0, 5),
          ativo: !!found.ativo,
        };
      });
      setEditingId(row.id);
      setForm({
        nome: data.nome || '',
        login: data.login || '',
        email: data.email || '',
        senha: '',
        perfil_id: data.perfil_id || '',
        status: data.status || 'A',
        hr_matt_entr: data.hr_matt_entr || '08:00',
        hr_matt_saida: data.hr_matt_saida || '12:00',
        hr_vesp_entr: data.hr_vesp_entr || '13:00',
        hr_vesp_saida: data.hr_vesp_saida || '18:00',
        horarios,
      });
      setModal(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, perfil_id: form.perfil_id || null };
      if (editingId) {
        if (!payload.senha) delete payload.senha;
        await apiFetch(`/admin/usuarios/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch('/admin/usuarios', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      setModal(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm('Desativar este usuário?')) return;
    await apiFetch(`/admin/usuarios/${id}`, { method: 'DELETE' });
    load();
  };

  const toggleDia = (dia, field, value) => {
    setForm((prev) => ({
      ...prev,
      horarios: prev.horarios.map((h) =>
        h.dia_semana === dia ? { ...h, [field]: value } : h
      ),
    }));
  };

  return (
    <div className="animate-in fade-in duration-500 pb-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
        <div>
          <h2 className="page-title">Usuários</h2>
          <p className="text-sm text-slate-500 mt-1">Cadastro, perfil e horário de acesso</p>
        </div>
        <button type="button" onClick={openNew} className="btn-primary w-full sm:w-auto">
          <Plus size={18} /> Novo Usuário
        </button>
      </div>

      <div className="filter-panel mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nome, login ou e-mail..."
            className="field-input pl-10"
            aria-label="Buscar usuários"
          />
        </div>
      </div>

      {error && !modal && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm" role="alert">{error}</div>}

      <div className="card-surface overflow-hidden">
        {loading ? (
          <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-500" size={40} /></div>
        ) : (
          <>
            <div className="cards-mobile p-3">
              {list.length === 0 && <p className="p-6 text-center text-slate-500 text-sm">Nenhum usuário encontrado.</p>}
              {list.map((u) => (
                <article key={u.id} className="mobile-card">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <h3 className="mobile-card-title truncate">{u.nome || '-'}</h3>
                      <p className="mobile-card-meta font-mono">{u.login}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-bold shrink-0 ${u.status === 'A' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                      {u.status === 'A' ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <p className="mobile-card-meta truncate">{u.email || u.email_legado || 'Sem e-mail'}</p>
                  <p className="mobile-card-meta">{u.perfil_nome || 'Sem perfil'}</p>
                  <div className="flex gap-2 pt-1">
                    <button type="button" onClick={() => openEdit(u)} className="btn-icon text-blue-600 bg-blue-50" aria-label="Editar"><Edit2 size={16} /></button>
                    <button type="button" onClick={() => remove(u.id)} className="btn-icon text-red-600 bg-red-50" aria-label="Excluir"><Trash2 size={16} /></button>
                  </div>
                </article>
              ))}
            </div>

            <div className="table-desktop overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 border-b">
                  <tr>
                    <th className="p-4">Nome</th>
                    <th className="p-4">Login</th>
                    <th className="p-4">E-mail</th>
                    <th className="p-4">Perfil</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((u) => (
                    <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-4 font-semibold text-slate-800">{u.nome || '-'}</td>
                      <td className="p-4 font-mono text-slate-600">{u.login}</td>
                      <td className="p-4 text-slate-600">{u.email || u.email_legado || '-'}</td>
                      <td className="p-4">{u.perfil_nome || '-'}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${u.status === 'A' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                          {u.status === 'A' ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button type="button" onClick={() => openEdit(u)} className="btn-icon text-blue-600 bg-blue-50" aria-label="Editar"><Edit2 size={16} /></button>
                        <button type="button" onClick={() => remove(u.id)} className="btn-icon text-red-600 bg-red-50" aria-label="Excluir"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                  {list.length === 0 && <tr><td colSpan="6" className="p-8 text-center text-slate-500">Nenhum usuário encontrado.</td></tr>}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8">
            <div className="flex justify-between items-center p-6 border-b bg-slate-50 rounded-t-2xl">
              <h3 className="text-xl font-bold text-slate-800">{editingId ? 'Editar Usuário' : 'Novo Usuário'}</h3>
              <button onClick={() => setModal(false)}><X size={22} className="text-slate-400" /></button>
            </div>
            <form onSubmit={save} className="p-6 space-y-5">
              {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Nome</label>
                  <input required value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 mt-1" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Login</label>
                  <input required value={form.login} onChange={(e) => setForm({ ...form, login: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 mt-1" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">E-mail</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 mt-1" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Senha {editingId && '(deixe em branco para manter)'}</label>
                  <input type="password" required={!editingId} value={form.senha} onChange={(e) => setForm({ ...form, senha: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 mt-1" maxLength={6} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Perfil</label>
                  <select value={form.perfil_id} onChange={(e) => setForm({ ...form, perfil_id: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 mt-1 bg-white">
                    <option value="">Selecione...</option>
                    {perfis.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 mt-1 bg-white">
                    <option value="A">Ativo</option>
                    <option value="I">Inativo</option>
                  </select>
                </div>
              </div>

              <fieldset className="border border-slate-200 rounded-xl p-4">
                <legend className="px-2 text-sm font-bold text-blue-600 uppercase">Horário legado (manhã / tarde)</legend>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    ['hr_matt_entr', 'Manhã início'],
                    ['hr_matt_saida', 'Manhã fim'],
                    ['hr_vesp_entr', 'Tarde início'],
                    ['hr_vesp_saida', 'Tarde fim'],
                  ].map(([k, label]) => (
                    <div key={k}>
                      <label className="text-xs text-slate-500">{label}</label>
                      <input type="time" value={form[k] || ''} onChange={(e) => setForm({ ...form, [k]: e.target.value })} className="w-full border border-slate-300 rounded-lg px-2 py-2 mt-1" />
                    </div>
                  ))}
                </div>
              </fieldset>

              <fieldset className="border border-slate-200 rounded-xl p-4">
                <legend className="px-2 text-sm font-bold text-blue-600 uppercase">Dias e horários permitidos</legend>
                <div className="space-y-2">
                  {form.horarios.map((h) => (
                    <div key={h.dia_semana} className="grid grid-cols-12 gap-2 items-center">
                      <label className="col-span-3 md:col-span-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                        <input type="checkbox" checked={h.ativo} onChange={(e) => toggleDia(h.dia_semana, 'ativo', e.target.checked)} />
                        {DIAS.find((d) => d.value === h.dia_semana)?.label}
                      </label>
                      <input type="time" disabled={!h.ativo} value={h.hora_inicio} onChange={(e) => toggleDia(h.dia_semana, 'hora_inicio', e.target.value)} className="col-span-4 md:col-span-3 border border-slate-300 rounded-lg px-2 py-1.5 disabled:opacity-40" />
                      <span className="col-span-1 text-center text-slate-400">até</span>
                      <input type="time" disabled={!h.ativo} value={h.hora_fim} onChange={(e) => toggleDia(h.dia_semana, 'hora_fim', e.target.value)} className="col-span-4 md:col-span-3 border border-slate-300 rounded-lg px-2 py-1.5 disabled:opacity-40" />
                    </div>
                  ))}
                </div>
              </fieldset>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setModal(false)} className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700">Cancelar</button>
                <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-blue-600 text-white flex items-center gap-2 disabled:opacity-60">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
