'use client';
import { useEffect, useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

type Tenant = { id: string; name: string; slug: string; plan: string; maxNotes: number };
type User = { id: string; email: string; role: string; tenant: Tenant };

export default function Page() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const t = localStorage.getItem('token');
    const u = localStorage.getItem('user');
    if (t && u) {
      setToken(t);
      setUser(JSON.parse(u));
    }
  }, []);

  const handleLogin = (tkn: string, u: User) => {
    localStorage.setItem('token', tkn);
    localStorage.setItem('user', JSON.stringify(u));
    setToken(tkn);
    setUser(u);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <>
      <h1>Multi‑Tenant Notes</h1>
      {!token || !user ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Dashboard token={token} user={user} onLogout={handleLogout} onUserUpdate={setUser} />
      )}
    </>
  );
}
