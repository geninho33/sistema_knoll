import { useEffect, useState } from 'react';
import { Plus, Edit2, Loader2, Trash2, X, Save, ChevronRight, ChevronDown } from 'lucide-react';
import { apiFetch } from '../../utils/api';

function PermTree({ nodes, selected, onToggle, depth = 0 }) {
  const [open, setOpen] = useState({});

  return (
    <ul className={depth === 0 ? 'space-y-1' : 'ml-4 mt-1 space-y-1 border-l border-slate-200 pl-3'}>
      {nodes.map((node) => {
        const hasChildren = node.children?.length > 0;
        const isOpen = open[node.id] ?? true;
        const consulta = node.permissoes?.find((p) => p.tipo === 'consulta');
        const escrita = node.permissoes?.find((p) => p.tipo === 'escrita');

        return (
          <li key={node.id}>
            <div className="flex flex-wrap items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-slate-50">
              {hasChildren ? (
                <button type="button" onClick={() => setOpen((o) => ({ ...o, [node.id]: !isOpen }))} className="text-slate-400">
                  {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
              ) : (
                <span className="w-4" />
              )}
              <span className="font-medium text-slate-800 text-sm flex-1 min-w-[140px]">{node.nome}</span>
              {consulta && (
                <label className="text-xs flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-1 rounded">
                  <input
                    type="checkbox"
                    checked={selected.includes(consulta.id)}
                    onChange={() => onToggle(consulta.id)}
                  />
                  Consulta
                </label>
              )}
              {escrita && (
                <label className="text-xs flex items-center gap-1 text-slate-600 bg-blue-50 px-2 py-1 rounded">
                  <input
                    type="checkbox"
                    checked={selected.includes(escrita.id)}
                    onChange={() => onToggle(escrita.id)}
                  />
                  Escrita
                </label>
              )}
            </div>
            {hasChildren && isOpen && (
              <PermTree nodes={node.children} selected={selected} onToggle={onToggle} depth={depth + 1} />
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default function PerfisModule() {
  const [list, setList] = useState([]);
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ nome: '', descricao: '', ativo: 1, permissoes: [] });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [perfis, menus] = await Promise.all([
        apiFetch('/admin/perfis'),
        apiFetch('/admin/menus'),
      ]);
      setList(perfis);
      setTree(menus.tree || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditingId(null);
    setForm({ nome: '', descricao: '', ativo: 1, permissoes: [] });
    setError('');
    setModal(true);
  };

  const openEdit = async (row) => {
    setError('');
    const data = await apiFetch(`/admin/perfis/${row.id}`);
    setEditingId(row.id);
    setForm({
      nome: data.nome,
      descricao: data.descricao || '',
      ativo: data.ativo ? 1 : 0,
      permissoes: data.permissoes || [],
    });
    setModal(true);
  };

  const togglePerm = (id) => {
    setForm((prev) => ({
      ...prev,
      permissoes: prev.permissoes.includes(id)
        ? prev.permissoes.filter((x) => x !== id)
        : [...prev.permissoes, id],
    }));
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        await apiFetch(`/admin/perfis/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(form),
        });
      } else {
        await apiFetch('/admin/perfis', {
          method: 'POST',
          body: JSON.stringify(form),
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
    if (!confirm('Excluir este perfil?')) return;
    try {
      await apiFetch(`/admin/perfis/${id}`, { method: 'DELETE' });
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Perfis</h2>
          <p className="text-sm text-slate-500">Permissões por item de menu (consulta / escrita)</p>
        </div>
        <button onClick={openNew} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
          <Plus size={18} /> Novo Perfil
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-500" size={40} /></div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 border-b">
              <tr>
                <th className="p-4">Nome</th>
                <th className="p-4">Descrição</th>
                <th className="p-4">Usuários</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4 font-semibold text-slate-800">{p.nome}</td>
                  <td className="p-4 text-slate-600">{p.descricao || '-'}</td>
                  <td className="p-4">{p.usuarios}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${p.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                      {p.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => openEdit(p)} className="p-2 text-blue-600 bg-blue-50 rounded"><Edit2 size={16} /></button>
                    <button onClick={() => remove(p.id)} className="p-2 text-red-600 bg-red-50 rounded"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8">
            <div className="flex justify-between items-center p-6 border-b bg-slate-50 rounded-t-2xl">
              <h3 className="text-xl font-bold">{editingId ? 'Editar Perfil' : 'Novo Perfil'}</h3>
              <button onClick={() => setModal(false)}><X size={22} className="text-slate-400" /></button>
            </div>
            <form onSubmit={save} className="p-6 space-y-4">
              {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Nome</label>
                  <input required value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 mt-1" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Status</label>
                  <select value={form.ativo} onChange={(e) => setForm({ ...form, ativo: Number(e.target.value) })} className="w-full border border-slate-300 rounded-lg px-3 py-2 mt-1 bg-white">
                    <option value={1}>Ativo</option>
                    <option value={0}>Inativo</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Descrição</label>
                <input value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 mt-1" />
              </div>
              <div className="border border-slate-200 rounded-xl p-4 max-h-[360px] overflow-y-auto">
                <p className="text-sm font-bold text-blue-600 uppercase mb-3">Permissões por menu</p>
                <PermTree nodes={tree} selected={form.permissoes} onToggle={togglePerm} />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setModal(false)} className="px-4 py-2 rounded-lg bg-slate-100">Cancelar</button>
                <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-blue-600 text-white flex items-center gap-2">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
