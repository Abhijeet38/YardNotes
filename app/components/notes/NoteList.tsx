'use client';
import React from 'react';

// --- Icons ---
const GlobeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>;
const LockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const LoaderIcon = () => <svg className="loader-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" /><line x1="4.93" y1="4.93" x2="7.76" y2="7.76" /><line x1="16.24" y1="16.24" x2="19.07" y2="19.07" /><line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" /><line x1="4.93" y1="19.07" x2="7.76" y2="16.24" /><line x1="16.24" y1="7.76" x2="19.07" y2="4.93" /></svg>;

// --- Types ---
type Note = { id: string; title: string; content: string; createdAt: string; isPublic: boolean; userId: string; user?: { id: string; email: string; }; };

interface NoteListProps {
  notes: Note[];
  isLoading: boolean;
  onDeleteNote: (id: string) => void;
  onEditNote?: (note: Note) => void;
  viewType: 'private' | 'public';
  currentUserId: string;
}

export default function NoteList({ notes, isLoading, onDeleteNote, onEditNote, viewType, currentUserId }: NoteListProps) {
  if (isLoading) {
    return <div className="loading-state"><LoaderIcon /> Loading Notes...</div>;
  }

  if (notes.length === 0) {
    return (
      <div className="empty-state">
        <h2>
            {viewType === 'private' ? "You have no private notes" : "No public notes yet"}
        </h2>
        <p>
            {viewType === 'private' ? "Click 'New Note' to get started." : "Be the first to create a public note for your team!"}
        </p>
      </div>
    );
  }

  return (
    <div className="notes-grid">
      {notes.map(note => (
        <div key={note.id} className={`note-card ${note.isPublic ? 'public' : 'private'}`}>
          <div className="note-card-header">
            <h3>{note.title}</h3>
            <div className="note-card-actions">
              {note.isPublic ? 
                <span className="visibility-icon" title="Public"><GlobeIcon/></span> : 
                <span className="visibility-icon" title="Private"><LockIcon/></span>
              }
              {note.userId === currentUserId && (
                <>
                  {onEditNote && (
                    <button onClick={() => onEditNote(note)} className="btn-icon btn-edit" title="Edit Note">
                      <EditIcon />
                    </button>
                  )}
                  <button onClick={() => onDeleteNote(note.id)} className="btn-icon btn-delete" title="Delete Note">
                    <TrashIcon />
                  </button>
                </>
              )}
            </div>
          </div>
          <p className="note-card-content">{note.content}</p>
          <div className="note-card-footer">
            <small>Created: {new Date(note.createdAt).toLocaleDateString()}</small>
            {note.isPublic && note.user && (
              <small className="note-author">By: {note.user.email}</small>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}