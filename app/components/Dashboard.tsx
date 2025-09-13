'use client';
import React, { useEffect, useState, useMemo } from 'react';

// --- Types ---
type Tenant = { id: string; name: string; slug: string; plan: string; maxNotes: number };
type User = { id: string; email: string; role: string; tenant: Tenant };
// Added isPublic to the Note type
type Note = { id: string; title: string; content: string; createdAt: string; isPublic: boolean; };

// --- SVG Icons ---
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;
const SparklesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5L12 2z"/></svg>;
const LoaderIcon = () => <svg className="loader-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" /><line x1="4.93" y1="4.93" x2="7.76" y2="7.76" /><line x1="16.24" y1="16.24" x2="19.07" y2="19.07" /><line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" /><line x1="4.93" y1="19.07" x2="7.76" y2="16.24" /><line x1="16.24" y1="7.76" x2="19.07" y2="4.93" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>;
const GlobeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>;
const LockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;


export default function Dashboard({ token, user, onLogout, onUserUpdate }: { token: string; user: User; onLogout: () => void; onUserUpdate: (u: User) => void; }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [noteView, setNoteView] = useState<'private' | 'public'>('private');
  
  // Admin specific state
  const [members, setMembers] = useState<User[]>([]);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  const apiBase = '/api';

  useEffect(() => { 
    fetchNotes();
    if (user.role === 'ADMIN') {
        fetchMembers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchNotes() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/notes`, { headers: { Authorization: `Bearer ${token}` }});
      if (!res.ok) throw new Error('Failed to fetch notes');
      const body = await res.json();
      setNotes(body);
    } catch {
      setError('Network error while fetching notes.');
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchMembers() {
    try {
        const res = await fetch(`${apiBase}/users`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error('Failed to fetch members');
        const body = await res.json();
        setMembers(body);
    } catch (err: any) {
        setError(err.message);
    }
  }

  async function inviteUser(e: React.FormEvent) {
      e.preventDefault();
      setIsInviting(true);
      setError(null);
      try {
          const res = await fetch(`${apiBase}/users/invite`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ email: newUserEmail }),
          });
          const body = await res.json();
          if (!res.ok) throw new Error(body.error || 'Failed to invite user');
          setNewUserEmail('');
          await fetchMembers(); // Refresh member list
      } catch (err: any) {
          setError(err.message);
      } finally {
          setIsInviting(false);
      }
  }


  async function createNote(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch(`${apiBase}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, content, isPublic })
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || 'Failed to create note');
      setTitle(''); setContent(''); setIsPublic(false);
      await fetchNotes();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function deleteNote(id: string) {
    setError(null);
    try {
      const res = await fetch(`${apiBase}/notes/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` }});
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body?.error || 'Failed to delete note');
      }
      setNotes(prevNotes => prevNotes.filter(n => n.id !== id));
    } catch (err: any) {
      setError(err.message);
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
      if (!res.ok) throw new Error(body?.error || 'Upgrade failed');
      const updated = { ...user, tenant: { ...user.tenant, plan: 'PRO', maxNotes: 2147483647 } };
      onUserUpdate(updated);
      localStorage.setItem('user', JSON.stringify(updated));
      await fetchNotes();
    } catch (err: any) {
      setError(err.message);
    }
  }

  const filteredNotes = useMemo(() => {
    if (noteView === 'public') {
        return notes.filter(n => n.isPublic);
    }
    // Assuming private notes are those not marked as public.
    // In a real app, you might also filter by author ID.
    return notes.filter(n => !n.isPublic);
  }, [notes, noteView]);

  const isAtLimit = user.tenant.plan === 'FREE' && notes.length >= user.tenant.maxNotes;
  const planClass = user.tenant.plan === 'FREE' ? 'plan-free' : 'plan-pro';

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-info">
          <h1>{user.tenant.name}'s Notes</h1>
          <div className="user-details">
            <span>{user.email} ({user.role})</span>
            <span className={`plan-badge ${planClass}`}>{user.tenant.plan}</span>
          </div>
        </div>
        <button onClick={onLogout} className="btn btn-secondary">
          <LogoutIcon /> Logout
        </button>
      </header>

      {error && <div className="error-banner">{error}</div>}
      
      {user.tenant.plan === 'FREE' && (
        <div className="upgrade-banner">
            <div className="plan-usage">
              <p>You've used {notes.length} of {user.tenant.maxNotes} notes on the Free plan.</p>
              <div className="usage-bar">
                <div className="usage-fill" style={{ width: `${(notes.length / user.tenant.maxNotes) * 100}%`}}></div>
              </div>
            </div>
            {user.role === 'ADMIN' && (
              <button onClick={upgradeTenant} className="btn btn-primary btn-upgrade">
                <SparklesIcon /> Upgrade to Pro
              </button>
            )}
        </div>
      )}

      <main className="dashboard-main">
        <aside className="dashboard-sidebar">
          <section className="create-note-section">
            <div className="card">
              <h2>Create a New Note</h2>
              <form onSubmit={createNote}>
                <div className="form-group">
                  <label htmlFor="title">Title</label>
                  <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="My awesome idea" required />
                </div>
                <div className="form-group">
                  <label htmlFor="content">Content</label>
                  <textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Details about my awesome idea..." required rows={5} />
                </div>
                <div className="form-group-toggle">
                    <label htmlFor="isPublic">Make Public</label>
                    <input type="checkbox" id="isPublic" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
                </div>
                <button type="submit" disabled={isAtLimit} className="btn btn-primary">
                  {isAtLimit ? 'Limit Reached' : (<><PlusIcon /> Create Note</>)}
                </button>
              </form>
            </div>
          </section>
          {user.role === 'ADMIN' && (
            <section className="admin-section">
                <div className="card">
                    <h2><UsersIcon/> Manage Members</h2>
                    <ul className="member-list">
                        {members.map(member => (
                            <li key={member.id}>
                                <span>{member.email}</span>
                                <span className="role-badge">{member.role}</span>
                            </li>
                        ))}
                    </ul>
                    <form onSubmit={inviteUser} className="invite-form">
                        <input type="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} placeholder="new.member@email.com" required/>
                        <button type="submit" className="btn-icon" disabled={isInviting}>
                            {isInviting ? <LoaderIcon/> : <SendIcon/>}
                        </button>
                    </form>
                </div>
            </section>
          )}
        </aside>

        <section className="notes-section">
            <div className="notes-view-toggle">
                <button onClick={() => setNoteView('private')} className={noteView === 'private' ? 'active' : ''}>
                    <LockIcon/> My Private Notes
                </button>
                <button onClick={() => setNoteView('public')} className={noteView === 'public' ? 'active' : ''}>
                    <GlobeIcon/> Organization Notes
                </button>
            </div>
          {isLoading ? (
            <div className="loading-state"><LoaderIcon /> Loading Notes...</div>
          ) : filteredNotes.length === 0 ? (
            <div className="empty-state">
                {noteView === 'private' ? "You haven't created any private notes yet." : "No organization notes found."}
            </div>
          ) : (
            <div className="notes-grid">
              {filteredNotes.map(n => (
                <div key={n.id} className="note-card">
                  <div className="note-card-header">
                    <h3>{n.title}</h3>
                    <div className="note-card-icons">
                        {n.isPublic ? <GlobeIcon/> : <LockIcon/>}
                        <button onClick={() => deleteNote(n.id)} className="btn-icon btn-delete">
                            <TrashIcon />
                        </button>
                    </div>
                  </div>
                  <p className="note-card-content">{n.content}</p>
                  <div className="note-card-footer">
                    <small>Created: {new Date(n.createdAt).toLocaleString()}</small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

