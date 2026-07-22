import { useState } from 'react';
import { Lock, User, AlertCircle, Loader2 } from 'lucide-react';

export default function Login({ onLogin }) {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, senha }),
      });

      const data = await response.json();

      if (!response.ok) {
        const msg = data.detalhe
          ? `${data.error}: ${data.detalhe}`
          : (data.error || 'Erro ao realizar login');
        throw new Error(msg);
      }

      onLogin(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 px-4 py-8 safe-pb safe-pt">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg ring-4 ring-blue-50">
              <span className="text-2xl sm:text-3xl text-white font-bold">MK</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800">MARLON KNOLL</h1>
            <p className="text-slate-500 mt-2 text-sm">Sistema de Assistência Técnica</p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 sm:p-4 rounded mb-5 flex items-start gap-3" role="alert">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <span className="text-sm font-medium break-words">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="field-label" htmlFor="login-usuario">Usuário</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User size={20} aria-hidden="true" />
                </div>
                <input
                  id="login-usuario"
                  type="text"
                  autoComplete="username"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  className="field-input pl-10"
                  placeholder="Digite seu login"
                  required
                />
              </div>
            </div>

            <div>
              <label className="field-label" htmlFor="login-senha">Senha</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock size={20} aria-hidden="true" />
                </div>
                <input
                  id="login-senha"
                  type="password"
                  autoComplete="current-password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="field-input pl-10"
                  placeholder="••••••"
                  required
                  maxLength={6}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full text-base">
              {loading ? <><Loader2 size={18} className="animate-spin" /> Autenticando...</> : 'Entrar no Sistema'}
            </button>
          </form>
        </div>
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100">
          <p className="text-xs text-center text-slate-400 font-medium">&copy; 2026 Marlon Knoll</p>
        </div>
      </div>
    </div>
  );
}
