import { useEffect, useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { INACTIVE_MSG } from './utils/api';

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

  const handleLogin = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    setSessionAlert('');
  };

  const handleUserUpdate = (partial) => {
    setUser((prev) => {
      const next = {
        ...prev,
        name: partial.name ?? prev?.name,
        email: partial.email ?? prev?.email,
        perfilNome: partial.perfilNome ?? prev?.perfilNome,
        status: partial.status ?? prev?.status,
      };
      localStorage.setItem('user', JSON.stringify(next));
      return next;
    });
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });
    } catch (_) {
      /* ignore */
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    const onEnded = (e) => {
      const msg = e.detail?.message || INACTIVE_MSG;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
      setSessionAlert(msg);
    };
    window.addEventListener('knoll:session-ended', onEnded);
    return () => window.removeEventListener('knoll:session-ended', onEnded);
  }, []);

  if (!token) {
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

  return <Dashboard user={user} onLogout={handleLogout} onUserUpdate={handleUserUpdate} />;
}

export default App;
