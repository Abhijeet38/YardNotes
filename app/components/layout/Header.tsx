'use client';
import React from 'react';

// --- Icons ---
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;

// --- Types ---
type Tenant = { name: string; plan: string; };
type User = { email: string; tenant: Tenant };

interface HeaderProps {
  user: User;
  onLogout: () => void;
  onNewNote: () => void;
  isNoteCreationDisabled: boolean;
}

export default function Header({ user, onLogout, onNewNote, isNoteCreationDisabled }: HeaderProps) {
  const planClass = user.tenant.plan === 'FREE' ? 'plan-free' : 'plan-pro';

  return (
    <header className="app-header">
      <div className="header-info">
        <h1>{user.tenant.name}</h1>
        <div className="user-details">
          <span>{user.email}</span>
          <span className={`plan-badge ${planClass}`}>{user.tenant.plan}</span>
        </div>
      </div>
      <div className="header-actions">
        <button 
          onClick={onNewNote} 
          className="btn btn-primary" 
          disabled={isNoteCreationDisabled}
        >
          <PlusIcon /> New Note
        </button>
        <button onClick={onLogout} className="btn btn-secondary">
          <LogoutIcon /> Logout
        </button>
      </div>
    </header>
  );
}