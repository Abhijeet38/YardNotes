'use client';
import { useEffect, useState } from 'react';

type Tenant = { id: string; name: string; slug: string; plan: string; maxNotes: number };
type User = { id: string; email: string; role: string; tenant: Tenant };
type Note = { id: string; title: string; content: string; createdAt: string };

export default function Dashboard({
  token,
  user,
  onLogout,
  onUserUpdate
}: {
  token: string;
  user: User;
  onLogout: () => void;
  onUserUpdate: (u: User) => void;
}) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const apiBase = '/api';

  useEffect(() => { fetchNotes(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  async function fetchNotes() {
    setError(null);
    try {
      const res = await fetch(`${apiBase}/notes`, { headers: { Authorization: `Bearer ${token}` }});
      if (!res.ok) {
        setError('Failed to fetch notes');
        return;
      }
      const body = await res.json();
      setNotes(body);
    } catch {
      setError('Network error');
    }
  }

  async function createNote(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    try {
      const res = await fetch(`${apiBase}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, content })
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body?.error || 'Failed to create');
        return;
      }
      setTitle(''); setContent('');
      fetchNotes();
    } catch {
      setError('Network error');
    }
  }

  async function deleteNote(id: string) {
    setError(null);
    try {
      const res = await fetch(`${apiBase}/notes/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` }});
      if (!res.ok) {
        const body = await res.json();
        setError(body?.error || 'Failed to delete');
        return;
      }
      fetchNotes();
    } catch {
      setError('Network error');
    }
  }

  async function upgradeTenant() {
    setError(null);
    try {
      const res = await fetch(`${apiBase}/tenants/${user.tenant.slug}/upgrade`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body?.error || 'Upgrade failed');
        return;
      }
      const updated = { ...user, tenant: { ...user.tenant, plan: 'PRO', maxNotes: 2147483647 } };
      onUserUpdate(updated);
      localStorage.setItem('user', JSON.stringify(updated));
      fetchNotes();
    } catch {
      setError('Network error');
    }
  }

  const isAtLimit = user.tenant.plan === 'FREE' && notes.length >= user.tenant.maxNotes;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>{user.email}</h2>
          <div>Role: {user.role} • Tenant: {user.tenant.name} • Plan: {user.tenant.plan}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onLogout}>Logout</button>
        </div>
      </div>

      <div style={{ marginTop: 16, padding: 12, background: '#f5f5f5' }}>
        <div>Free plan: {notes.length}/{user.tenant.maxNotes} notes</div>
        {user.role === 'ADMIN' && user.tenant.plan === 'FREE' && (
          <button onClick={upgradeTenant} style={{ marginTop: 8 }}>Upgrade to Pro</button>
        )}
      </div>

      <section style={{ marginTop: 20 }}>
        <h3>Create Note</h3>
        <form onSubmit={createNote}>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required style={{ width: '100%', padding: 8, marginBottom: 8 }} />
          <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Content" required style={{ width: '100%', padding: 8, height: 120 }} />
          <div style={{ marginTop: 8 }}>
            <button type="submit" disabled={isAtLimit} style={{ padding: '8px 12px' }}>
              {isAtLimit ? 'Limit reached — upgrade' : 'Create'}
            </button>
          </div>
        </form>
      </section>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <section style={{ marginTop: 24 }}>
        <h3>Notes</h3>
        {notes.length === 0 && <div>No notes yet.</div>}
        {notes.map(n => (
          <div key={n.id} style={{ border: '1px solid #ddd', padding: 12, marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>{n.title}</strong>
              <small>{new Date(n.createdAt).toLocaleString()}</small>
            </div>
            <p style={{ marginTop: 8 }}>{n.content}</p>
            <div>
              <button onClick={() => deleteNote(n.id)} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '6px 10px' }}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
