import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { apiFetch, INACTIVE_MSG } from './utils/api';

const MODULE_PATHS = {
  home: '/',
  clientes: '/clientes',
  ordens: '/ordens',
  agenda: '/agenda',
  atendimento: '/atendimento',
  rel_clientes: '/relatorios/clientes',
  rel_servicos: '/relatorios/servicos',
  rel_pecas: '/relatorios/pecas',
  rel_produtos: '/relatorios/produtos',
  admin_usuarios: '/admin/usuarios',
  admin_perfis: '/admin/perfis',
  admin_acessos: '/admin/acessos',
  admin_empresa: '/admin/empresa',
  admin_auditoria: '/admin/auditoria',
};

const PATH_MODULES = Object.fromEntries(
  Object.entries(MODULE_PATHS).map(([moduleId, path]) => [path, moduleId])
);

export function moduleToPath(moduleId) {
  return MODULE_PATHS[moduleId] || '/';
}

export function pathToModule(pathname) {
  if (PATH_MODULES[pathname]) return PATH_MODULES[pathname];
  // fallback: /relatorios/foo
  const entry = Object.entries(MODULE_PATHS).find(([, p]) => p === pathname);
  return entry ? entry[0] : 'home';
}

function ProtectedApp({ user, setUser, onLogout, onUserUpdate, sessionChecking }) {
  if (sessionChecking) {
    return (
      <div className="min-h-dvh flex items-center justify-center text-slate-500 text-sm">
        Validando sessão...
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return (
    <Dashboard
      user={user}
      onLogout={onLogout}
      onUserUpdate={onUserUpdate}
      pathToModule={pathToModule}
      moduleToPath={moduleToPath}
    />
  );
}

function LoginPage({ onLogin, sessionAlert, setSessionAlert, user }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  const handleLogin = (data) => {
    onLogin(data);
    navigate('/', { replace: true });
  };

  return (
    <>
      {sessionAlert && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] max-w-md w-[calc(100%-2rem)] rounded-lg border border-amber-200 bg-amber-50 text-amber-900 px-4 py-3 text-sm shadow-lg">
          {sessionAlert}
          <button
            type="button"
            className="float-right text-amber-700 font-bold ml-2"
            onClick={() => setSessionAlert('')}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>
      )}
      <Login onLogin={handleLogin} />
    </>
  );
}

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  });
  const [sessionAlert, setSessionAlert] = useState('');
  const [sessionChecking, setSessionChecking] = useState(!!localStorage.getItem('token'));

  const handleLogin = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    setSessionAlert('');
    setSessionChecking(false);
  };

  const handleUserUpdate = (partial) => {
    setUser((prev) => {
      const next = {
        ...prev,
        name: partial.name ?? prev?.name,
        email: partial.email ?? prev?.email,
        perfilNome: partial.perfilNome ?? prev?.perfilNome,
        status: partial.status ?? prev?.status,
        permissions: partial.permissions ?? prev?.permissions,
      };
      localStorage.setItem('user', JSON.stringify(next));
      return next;
    });
  };

  const clearSession = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const handleLogout = async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch (_) {
      /* ignore */
    }
    clearSession();
  };

  useEffect(() => {
    const onEnded = (e) => {
      const msg = e.detail?.message || INACTIVE_MSG;
      clearSession();
      setSessionAlert(msg);
      setSessionChecking(false);
    };
    window.addEventListener('knoll:session-ended', onEnded);
    return () => window.removeEventListener('knoll:session-ended', onEnded);
  }, []);

  // Validação de sessão no boot
  useEffect(() => {
    if (!token) {
      setSessionChecking(false);
      return undefined;
    }
    let cancelled = false;
    (async () => {
      try {
        const profile = await apiFetch('/auth/me');
        if (cancelled) return;
        const next = {
          ...user,
          id: profile.id,
          sysId: profile.sysId,
          name: profile.name,
          login: profile.login,
          email: profile.email,
          perfilId: profile.perfilId,
          perfilNome: profile.perfilNome,
          status: profile.status,
          permissions: profile.permissions || [],
        };
        localStorage.setItem('user', JSON.stringify(next));
        setUser(next);
      } catch (err) {
        if (cancelled) return;
        clearSession();
        if (err.code === 'USER_INACTIVE') {
          setSessionAlert(err.message || INACTIVE_MSG);
        }
      } finally {
        if (!cancelled) setSessionChecking(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={(
            <LoginPage
              onLogin={handleLogin}
              sessionAlert={sessionAlert}
              setSessionAlert={setSessionAlert}
              user={token ? user : null}
            />
          )}
        />
        <Route
          path="/*"
          element={(
            <ProtectedApp
              user={token ? user : null}
              setUser={setUser}
              onLogout={handleLogout}
              onUserUpdate={handleUserUpdate}
              sessionChecking={sessionChecking}
            />
          )}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
