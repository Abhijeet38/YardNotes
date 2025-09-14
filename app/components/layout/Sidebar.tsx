// components/layout/Sidebar.tsx
'use client';
import React from 'react';

// --- Icons ---
const LockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;
const GlobeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const FileTextIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;

type ActiveView = 'my-notes' | 'public-notes' | 'members';

interface SidebarProps {
  userRole: string; 
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
}

export default function Sidebar({ userRole, activeView, onNavigate }: SidebarProps) {
  const navItems = [
    { id: 'my-notes', label: 'My Notes', icon: <LockIcon /> },
    { id: 'public-notes', label: 'Public Notes', icon: <GlobeIcon /> },
    ...(userRole === 'ADMIN' ? [{ id: 'members', label: 'Manage Members', icon: <UsersIcon /> }] : [])
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <FileTextIcon />
        <h1>Notes SaaS</h1>
      </div>
      <nav className="sidebar-nav">
        <ul>
          {navItems.map(item => (
            <li key={item.id}>
              <button 
                className={`nav-button ${activeView === item.id ? 'active' : ''}`}
                onClick={() => onNavigate(item.id as ActiveView)}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}