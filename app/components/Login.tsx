'use client';
import React, { useState } from 'react';

const LoaderIcon = () => (
    <svg className="loader-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="2" x2="12" y2="6" />
        <line x1="12" y1="18" x2="12" y2="22" />
        <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
        <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
        <line x1="2" y1="12" x2="6" y2="12" />
        <line x1="18" y1="12" x2="22" y2="12" />
        <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
        <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
    </svg>
);

const FileTextIcon = () => (
    <svg className="file-text-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
);

type Tenant = { id: string; name: string; slug: string; plan: string; maxNotes: number };
type User = { id: string; email: string; role: string; tenant: Tenant };

export default function Login({ onLogin }: { onLogin: (token: string, user: User) => void }) {
  const [email, setEmail] = useState('admin@acme.test');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const apiBase = '/api'; 

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch(`${apiBase}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body?.error || 'Login failed');
      }
      onLogin(body.token, body.user);
    } catch (err: any) {
      setError(err.message || 'A network error occurred.');
    } finally {
        setIsLoading(false);
    }
  }

  const fillTestData = (testEmail: string) => {
    setEmail(testEmail);
    setPassword('password');
  }

  const testAccounts = [
    'admin@acme.test',
    'user@acme.test',
    'admin@globex.test',
    'user@globex.test'
  ];

  return (
    <div className="login-page-container">
      <div className="login-wrapper">
        <div className="login-header">
          <FileTextIcon />
          <h1>Notes SaaS</h1>
        </div>
        <p className="login-subtitle">Your secure, multi-tenant note-taking application.</p>
        <div className="login-card">
          <h2>Sign in to your account</h2>
          <form onSubmit={submit}>
            {error && (
              <div className="error-banner" role="alert">
                <p>{error}</p>
              </div>
            )}
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="login-button"
            >
              {isLoading ? <LoaderIcon /> : 'Login'}
            </button>
          </form>
        </div>
        <div className="test-accounts-section">
          <p>Test Accounts (password: `password`)</p>
          <div className="test-accounts-buttons">
            {testAccounts.map((account) => (
              <button key={account} onClick={() => fillTestData(account)}>
                {account.split('@')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}