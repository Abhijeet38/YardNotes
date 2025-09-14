'use client';
import React, { useState, useEffect } from 'react';

// --- SVG Icons ---
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>;
const LoaderIcon = () => <svg className="loader-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" /><line x1="4.93" y1="4.93" x2="7.76" y2="7.76" /><line x1="16.24" y1="16.24" x2="19.07" y2="19.07" /><line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" /><line x1="4.93" y1="19.07" x2="7.76" y2="16.24" /><line x1="16.24" y1="7.76" x2="19.07" y2="4.93" /></svg>;

type Tenant = { id: string; name: string; slug: string; plan: string; maxNotes: number };
type User = { id: string; email: string; role: string; tenant: Tenant };

interface MemberManagementProps {
  token: string;
  user: User;
  onError: (error: string | null) => void;
}

export default function MemberManagement({ token, user, onError }: MemberManagementProps) {
  const [members, setMembers] = useState<User[]>([]);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  
  const apiBase = '/api';
  
  useEffect(() => {
    fetchMembers();
  }, []);
  
  async function fetchMembers() {
    try {
      const res = await fetch(`${apiBase}/users`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      if (!res.ok) throw new Error('Failed to fetch members');
      const body = await res.json();
      setMembers(body);
    } catch (err: any) {
      onError(err.message);
    }
  }

  async function inviteUser(e: React.FormEvent) {
    e.preventDefault();
    setIsInviting(true);
    onError(null);
    try {
      const emailParts = newUserEmail.split('@');
      const tenantDomain = user.tenant.slug + '.test';
      
      if (emailParts.length !== 2 || emailParts[1] !== tenantDomain) {
        throw new Error(`Email must have @${tenantDomain} domain`);
      }
      
      const res = await fetch(`${apiBase}/tenants/${user.tenant.slug}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email: newUserEmail, role: 'MEMBER' }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Failed to invite user');
      setNewUserEmail('');
      await fetchMembers(); 
    } catch (err: any) {
      onError(err.message);
    } finally {
      setIsInviting(false);
    }
  }

  return (
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
          <div className="email-input-container">
            <input 
              type="text" 
              value={newUserEmail.split('@')[0] || ''}
              onChange={(e) => setNewUserEmail(e.target.value + '@' + user.tenant.slug + '.test')}
              placeholder="username" 
              required
            />
            <span className="email-domain">@{user.tenant.slug}.test</span>
          </div>
          <button type="submit" className="btn-icon email-btn" disabled={isInviting}>
            {isInviting ? <LoaderIcon/> : <SendIcon/>}
          </button>
        </form>
      </div>
    </section>
  );
}
