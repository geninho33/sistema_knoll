import { useEffect, useRef, useState } from 'react';
import { User, ChevronDown, KeyRound, LogOut, UserCircle, Loader2, Save } from 'lucide-react';
import Modal from './ui/Modal';
import { apiFetch } from '../utils/api';

export default function UserMenu({ user, onLogout, onUserUpdate }) {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '' });
  const [pwd, setPwd] = useState({ senha_atual: '', nova_senha: '', confirmar_senha: '' });
  const ref = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const openProfile = async () => {
    setOpen(false);
    setProfileOpen(true);
    setMsg('');
    setError('');
    setLoadingProfile(true);
    try {
      const data = await apiFetch('/auth/me');
      setProfile(data);
      setForm({ name: data.name || '', email: data.email || '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingProfile(false);
    }
  };

  const openPassword = () => {
    setOpen(false);
    setPasswordOpen(true);
    setPwd({ senha_atual: '', nova_senha: '', confirmar_senha: '' });
    setMsg('');
    setError('');
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMsg('');
    try {
      const data = await apiFetch('/auth/me', {
        method: 'PUT',
        body: JSON.stringify(form),
      });
      setMsg('Dados atualizados com sucesso.');
      setProfile((p) => ({ ...p, ...data.user }));
      onUserUpdate?.(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMsg('');
    try {
      const data = await apiFetch('/auth/me/senha', {
        method: 'PUT',
        body: JSON.stringify(pwd),
      });
      setMsg(data.message || 'Senha alterada com sucesso.');
      setPwd({ senha_atual: '', nova_senha: '', confirmar_senha: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const displayName = user?.name || user?.login || 'UsuÃ¡rio';

  return (
    <>
      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 min-h-touch px-2 sm:px-3 rounded-xl hover:bg-slate-100 transition-colors touch-manipulation"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label="Menu do usuÃ¡rio"
        >
          <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
            <User size={18} aria-hidden="true" />
          </div>
          <div className="hidden sm:block text-left min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate max-w-[140px] lg:max-w-[180px]">{displayName}</p>
            <p className="text-[11px] text-slate-500 truncate">{user?.perfilNome || user?.login}</p>
          </div>
          <ChevronDown size={16} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>

        {open && (
          <div
            role="menu"
            className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="px-3 py-2 border-b border-slate-100 sm:hidden">
              <p className="text-sm font-bold text-slate-800 truncate">{displayName}</p>
              <p className="text-xs text-slate-500 truncate">{user?.perfilNome || user?.login}</p>
            </div>
            <button
              type="button"
              role="menuitem"
              onClick={openProfile}
              className="w-full flex items-center gap-3 px-3 py-3 text-sm text-slate-700 hover:bg-slate-50 min-h-touch"
            >
              <UserCircle size={18} /> Meu Perfil
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={openPassword}
              className="w-full flex items-center gap-3 px-3 py-3 text-sm text-slate-700 hover:bg-slate-50 min-h-touch"
            >
              <KeyRound size={18} /> Alterar Senha
            </button>
            <div className="border-t border-slate-100 my-1" />
            <button
              type="button"
              role="menuitem"
              onClick={() => { setOpen(false); onLogout?.(); }}
              className="w-full flex items-center gap-3 px-3 py-3 text-sm text-red-600 hover:bg-red-50 min-h-touch"
            >
              <LogOut size={18} /> Sair do Sistema
            </button>
          </div>
        )}
      </div>

      <Modal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        title="Meu Perfil"
        size="md"
        footer={
          <>
            <button type="button" className="btn-secondary w-full sm:w-auto" onClick={() => setProfileOpen(false)}>Fechar</button>
            <button type="submit" form="form-perfil" className="btn-primary w-full sm:w-auto" disabled={saving || loadingProfile}>
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Salvar
            </button>
          </>
        }
      >
        {loadingProfile ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-500" size={32} /></div>
        ) : (
          <form id="form-perfil" onSubmit={saveProfile} className="space-y-4">
            {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm" role="alert">{error}</div>}
            {msg && <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm" role="status">{msg}</div>}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="field-label" htmlFor="perfil-nome">Nome completo</label>
                <input id="perfil-nome" className="field-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="field-label">Login</label>
                <input className="field-input bg-slate-50" value={profile?.login || ''} readOnly />
              </div>
              <div>
                <label className="field-label">Perfil</label>
                <input className="field-input bg-slate-50" value={profile?.perfilNome || '-'} readOnly />
              </div>
              <div className="sm:col-span-2">
                <label className="field-label" htmlFor="perfil-email">E-mail</label>
                <input id="perfil-email" type="email" className="field-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label className="field-label">Status</label>
                <input className="field-input bg-slate-50" value={profile?.status === 'A' ? 'Ativo' : 'Inativo'} readOnly />
              </div>
              <div>
                <label className="field-label">Ãšltimo acesso</label>
                <input
                  className="field-input bg-slate-50"
                  value={profile?.ultimoAcesso ? new Date(profile.ultimoAcesso).toLocaleString('pt-BR') : '-'}
                  readOnly
                />
              </div>
            </div>

            <button type="button" className="btn-secondary w-full sm:w-auto" onClick={() => { setProfileOpen(false); openPassword(); }}>
              <KeyRound size={16} /> Alterar senha
            </button>
          </form>
        )}
      </Modal>

      <Modal
        open={passwordOpen}
        onClose={() => setPasswordOpen(false)}
        title="Alterar Senha"
        size="sm"
        footer={
          <>
            <button type="button" className="btn-secondary w-full sm:w-auto" onClick={() => setPasswordOpen(false)}>Cancelar</button>
            <button type="submit" form="form-senha" className="btn-primary w-full sm:w-auto" disabled={saving}>
              {saving ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
              Confirmar
            </button>
          </>
        }
      >
        <form id="form-senha" onSubmit={savePassword} className="space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm" role="alert">{error}</div>}
          {msg && <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm" role="status">{msg}</div>}
          <div>
            <label className="field-label" htmlFor="senha-atual">Senha atual</label>
            <input id="senha-atual" type="password" autoComplete="current-password" className="field-input" value={pwd.senha_atual} onChange={(e) => setPwd({ ...pwd, senha_atual: e.target.value })} required maxLength={72} />
          </div>
          <div>
            <label className="field-label" htmlFor="nova-senha">Nova senha</label>
            <input id="nova-senha" type="password" autoComplete="new-password" className="field-input" value={pwd.nova_senha} onChange={(e) => setPwd({ ...pwd, nova_senha: e.target.value })} required minLength={4} maxLength={72} />
            <p className="text-xs text-slate-500 mt-1">MÃ­nimo 4 e mÃ¡ximo 6 caracteres.</p>
          </div>
          <div>
            <label className="field-label" htmlFor="confirmar-senha">Confirmar nova senha</label>
            <input id="confirmar-senha" type="password" autoComplete="new-password" className="field-input" value={pwd.confirmar_senha} onChange={(e) => setPwd({ ...pwd, confirmar_senha: e.target.value })} required maxLength={72} />
          </div>
        </form>
      </Modal>
    </>
  );
}
