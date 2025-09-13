'use client';
import { useEffect, useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

// Make sure to import the new CSS file
// import './styles/dashboard.css';

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
      try {
        setUser(JSON.parse(u));
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
        handleLogout();
      }
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
    <main>
      {!token || !user ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Dashboard token={token} user={user} onLogout={handleLogout} onUserUpdate={setUser} />
      )}
    </main>
  );
}
