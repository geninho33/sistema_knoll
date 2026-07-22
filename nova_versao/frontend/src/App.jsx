import { useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  });

  const handleLogin = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
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
      await fetch('http://localhost:3001/api/auth/logout', {
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

  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  return <Dashboard user={user} onLogout={handleLogout} onUserUpdate={handleUserUpdate} />;
}

export default App;
