'use client';
import React from 'react';

// --- SVG Icons ---
const SparklesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5L12 2z"/></svg>;

type Tenant = { id: string; name: string; slug: string; plan: string; maxNotes: number };
type User = { id: string; email: string; role: string; tenant: Tenant };

interface TenantUpgradeProps {
  token: string;
  user: User;
  notes: Array<any>;
  onError: (error: string | null) => void;
  onUserUpdate: (user: User) => void;
}

export default function TenantUpgrade({ token, user, notes, onError, onUserUpdate }: TenantUpgradeProps) {
  const apiBase = '/api';

  async function upgradeTenant() {
    onError(null);
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
    } catch (err: any) {
      onError(err.message);
    }
  }

  return (
    <div className="upgrade-banner">
      <div className="plan-usage">
        <p>You've used {notes.length} of {user.tenant.maxNotes} notes on the Free plan.</p>
        <div className="usage-bar">
          <div 
            className="usage-fill" 
            style={{ width: `${(notes.length / user.tenant.maxNotes) * 100}%`}}
          />
        </div>
      </div>
      {user.role === 'ADMIN' && (
        <button onClick={upgradeTenant} className="btn btn-primary btn-upgrade">
          <SparklesIcon /> Upgrade to Pro
        </button>
      )}
    </div>
  );
}
