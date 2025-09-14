'use client';
import React, { useEffect, useState } from 'react';

// --- Child Components ---
import Sidebar from './layout/Sidebar';
import Header from './layout/header';
import NoteList from './notes/NoteList';
import MemberManagement from './admin/MemberManagement';
import NoteCreatorModal from './notes/NoteCreator';
import NoteEditor from './notes/NoteEditor';
import TenantUpgrade from './admin/TenantUpgrade';

// --- Types ---
type Tenant = { id: string; name: string; slug: string; plan: string; maxNotes: number };
type User = { id: string; email: string; role: string; tenant: Tenant };
type Note = { id: string; title: string; content: string; createdAt: string; isPublic: boolean; userId: string; user?: { id: string; email: string; }; };
type ActiveView = 'my-notes' | 'public-notes' | 'members';

// --- Main Component ---
export default function Dashboard({ token, user, onLogout, onUserUpdate }: { token: string; user: User; onLogout: () => void; onUserUpdate: (u: User) => void; }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState<ActiveView>('my-notes');
  const [isNoteCreatorOpen, setIsNoteCreatorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const apiBase = '/api';

  // --- Data Fetching ---
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

  useEffect(() => { 
    fetchNotes();
  }, []);

  // --- Note Operations ---
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

  const handleNoteCreated = () => {
    setIsNoteCreatorOpen(false);
    fetchNotes();
  };
  
  const handleNoteUpdated = () => {
    setEditingNote(null);
    fetchNotes();
  };
  
  const isAtLimit = user.tenant.plan === 'FREE' && notes.filter(n => n.userId === user.id).length >= user.tenant.maxNotes;

  // --- Render Logic ---
  const renderActiveView = () => {
    switch(activeView) {
      case 'my-notes':
        return <NoteList
          notes={notes.filter(n => n.userId === user.id)}
          isLoading={isLoading}
          onDeleteNote={deleteNote}
          onEditNote={setEditingNote}
          viewType="private"
          currentUserId={user.id}
        />;
      case 'public-notes':
        return <NoteList
          notes={notes.filter(n => n.isPublic)}
          isLoading={isLoading}
          onDeleteNote={deleteNote}
          onEditNote={note => note.userId === user.id ? setEditingNote(note) : null}
          viewType="public"
          currentUserId={user.id}
        />;
      case 'members':
        return user.role === 'ADMIN' ? <MemberManagement token={token} user={user} onError={setError} /> : null;
      default:
        return null;
    }
  }

  return (
    <div className="app-layout">
      <Sidebar 
        userRole={user.role}
        activeView={activeView}
        onNavigate={setActiveView}
      />
      
      <div className="main-content">
        <Header 
          user={user}
          onLogout={onLogout}
          onNewNote={() => setIsNoteCreatorOpen(true)}
          isNoteCreationDisabled={isAtLimit}
        />

        <main className="content-area">
           {error && <div className="error-banner">{error}</div>}
      
          {user.tenant.plan === 'FREE' && (
            <TenantUpgrade 
              token={token}
              user={user}
              notes={notes.filter(n => n.userId === user.id)}
              onError={setError}
              onUserUpdate={onUserUpdate}
            />
          )}

          {renderActiveView()}
        </main>
      </div>

      {isNoteCreatorOpen && (
        <NoteCreatorModal
          token={token}
          onError={setError}
          onClose={() => setIsNoteCreatorOpen(false)}
          onNoteCreated={handleNoteCreated}
        />
      )}
      
      {editingNote && (
        <NoteEditor
          token={token}
          note={editingNote}
          onError={setError}
          onClose={() => setEditingNote(null)}
          onNoteUpdated={handleNoteUpdated}
        />
      )}
    </div>
  );
}