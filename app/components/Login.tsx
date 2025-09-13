'use client';
import { useState } from 'react';

type Tenant = { id: string; name: string; slug: string; plan: string; maxNotes: number };
type User = { id: string; email: string; role: string; tenant: Tenant };

export default function Login({ onLogin }: { onLogin: (token: string, user: User) => void }) {
  const [email, setEmail] = useState('admin@acme.test');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState<string | null>(null);

  const apiBase = '/api';

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    try {
      const res = await fetch(`${apiBase}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body?.error || 'Login failed');
        return;
      }
      onLogin(body.token, body.user);
    } catch (err) {
      setError('Network error');
    }
  }

  const testAccounts = [
    'admin@acme.test',
    'user@acme.test',
    'admin@globex.test',
    'user@globex.test'
  ];

  return (
    <div style={{ maxWidth: 480 }}>
      <h2>Login</h2>
      <form onSubmit={submit}>
        <div style={{ marginBottom: 8 }}>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" style={{ width: '100%', padding: 8 }} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" style={{ width: '100%', padding: 8 }} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" style={{ padding: '8px 12px' }}>Login</button>
        </div>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ marginTop: 16 }}>
        <h4>Test accounts (password: password)</h4>
        {testAccounts.map(a => (
          <button key={a} onClick={() => { setEmail(a); setPassword('password'); }} style={{ display: 'block', margin: '6px 0', padding: '6px 10px' }}>
            {a}
          </button>
        ))}
      </div>
    </div>
  );
}
