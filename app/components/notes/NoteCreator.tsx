// components/notes/NoteCreatorModal.tsx
'use client';
import React, { useState } from 'react';

// --- Icons ---
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

interface NoteCreatorModalProps {
  token: string;
  onError: (error: string | null) => void;
  onClose: () => void;
  onNoteCreated: () => void;
}

export default function NoteCreatorModal({ token, onError, onClose, onNoteCreated }: NoteCreatorModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const apiBase = '/api';

  async function createNote(e: React.FormEvent) {
    e.preventDefault();
    onError(null);
    try {
      const res = await fetch(`${apiBase}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, content, isPublic })
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || 'Failed to create note');
      
      onNoteCreated();
    } catch (err: any) {
      onError(err.message);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create a New Note</h2>
          <button onClick={onClose} className="btn-icon"><XIcon /></button>
        </div>
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
            <label htmlFor="isPublic">Make this note public to the organization</label>
            <input type="checkbox" id="isPublic" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary"><PlusIcon /> Create Note</button>
          </div>
        </form>
      </div>
    </div>
  );
}