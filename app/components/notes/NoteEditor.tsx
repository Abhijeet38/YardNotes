'use client';
import React, { useState, useEffect } from 'react';

// --- Icons ---
const SaveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

// --- Types ---
type Note = { id: string; title: string; content: string; createdAt: string; isPublic: boolean; userId: string; };

interface NoteEditorProps {
  token: string;
  note: Note;
  onError: (error: string | null) => void;
  onClose: () => void;
  onNoteUpdated: () => void;
}

export default function NoteEditor({ token, note, onError, onClose, onNoteUpdated }: NoteEditorProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [isPublic, setIsPublic] = useState(note.isPublic);
  const apiBase = '/api';

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    setIsPublic(note.isPublic);
  }, [note]);

  async function updateNote(e: React.FormEvent) {
    e.preventDefault();
    onError(null);
    try {
      const res = await fetch(`${apiBase}/notes/${note.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, content, isPublic })
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || 'Failed to update note');
      
      onNoteUpdated();
    } catch (err: any) {
      onError(err.message);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Note</h2>
          <button onClick={onClose} className="btn-icon"><XIcon /></button>
        </div>
        <form onSubmit={updateNote}>
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
            <button type="submit" className="btn btn-primary"><SaveIcon /> Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}
