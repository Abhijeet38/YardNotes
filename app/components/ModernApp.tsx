'use client';
import React, { useState, useEffect, useCallback } from 'react';

// --- Configuration ---
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// --- Helper Functions & Hooks ---
const decodeJwt = (token: string | null) => {
  try {
    if (!token) return null;
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    // ignore
    return null;
  }
};

const useApi = (token: string | null) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const apiCall = useCallback(async (endpoint: string, method = 'GET', body: any = null) => {
        setIsLoading(true);
        setError(null);
        try {
            const headers: Record<string,string> = {
                'Content-Type': 'application/json'
            };
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const options: any = {
                method,
                headers,
            };
            if (body) options.body = JSON.stringify(body);
            const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
            const contentType = response.headers.get('content-type') || '';
            const data = contentType.includes('application/json') ? await response.json() : null;

            if (!response.ok) {
                 throw data || { message: `Request failed with status ${response.status}` };
            }
            return data;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    return { apiCall, isLoading, error, setError };
};

// --- Icons ---
const LoaderIcon = ({ className = 'w-6 h-6' }: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${className} animate-spin`}>
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

const Trash2Icon = ({ className = 'w-6 h-6' }: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const ZapIcon = ({ className = 'w-6 h-6' }: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
);

// --- Reusable UI Components ---
const Modal: React.FC<any> = ({ show, onClose, title, children }) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto transform transition-all" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
};

const NewNoteForm: React.FC<any> = ({ onCreate, isLoading, error }) => {
    const [content, setContent] = useState('');
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;
        onCreate(content);
        setContent('');
    };
    return (
        <form onSubmit={handleSubmit} className="mb-8">
            <div className="relative">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="What's on your mind?"
                    className="w-full p-4 pr-24 text-gray-700 bg-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                    rows={3}
                />
                <button
                    type="submit"
                    disabled={isLoading || !content.trim()}
                    className="absolute top-1/2 right-3 transform -translate-y-1/2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-700 transition disabled:bg-indigo-300 disabled:cursor-not-allowed flex items-center"
                >
                  {isLoading ? <LoaderIcon className="w-5 h-5"/> : 'Add Note'}
                </button>
            </div>
             {error && <p className="text-red-500 text-sm mt-2">{error.message || String(error)}</p>}
        </form>
    );
};

const NoteCard: React.FC<any> = ({ note, onDelete }) => (
    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 group relative">
        <button 
            onClick={() => onDelete(note.id)} 
            className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
            aria-label="Delete note"
        >
            <Trash2Icon className="w-5 h-5" />
        </button>
        <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
    </div>
);

const UpgradeModal: React.FC<any> = ({ show, onClose, onUpgrade, isLoading, user }) => (
    <Modal show={show} onClose={onClose} title="Upgrade to Pro">
        <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
                <ZapIcon className="h-8 w-8 text-yellow-500" />
            </div>
            <p className="text-gray-600 mb-2">You've reached the 3-note limit on the Free plan.</p>
            <h4 className="text-xl font-semibold text-gray-800 mb-6">Unlock unlimited notes with Pro!</h4>
            {user?.role === 'ADMIN' ? (
                <button
                    onClick={onUpgrade}
                    disabled={isLoading}
                    className="w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-all duration-300 flex items-center justify-center disabled:bg-indigo-400"
                >
                    {isLoading ? <LoaderIcon className="w-5 h-5"/> : 'Upgrade Now'}
                </button>
            ) : (
                <p className="text-sm text-gray-500 bg-gray-100 p-3 rounded-md">Please contact your administrator to upgrade the plan.</p>
            )}
        </div>
    </Modal>
);

// --- Dashboard Component ---
const Dashboard: React.FC<any> = ({ user, token, onLogout }) => {
    const [notes, setNotes] = useState<any[]>([]);
    const { apiCall, isLoading, error: apiError, setError: setApiError } = useApi(token);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [isUpgrading, setIsUpgrading] = useState(false);
    const [currentPlan, setCurrentPlan] = useState(user?.tenant?.plan || 'FREE');

    const fetchNotes = useCallback(async () => {
        try {
            const data = await apiCall('/notes');
            setNotes(data || []);
        } catch (err) {
            console.error('Failed to fetch notes:', err);
        }
    }, [apiCall]);

    useEffect(() => { fetchNotes(); }, [fetchNotes]);

    const handleCreateNote = async (content: string) => {
        setIsCreating(true);
        setApiError(null);
        try {
            await apiCall('/notes', 'POST', { title: 'Note', content });
            await fetchNotes();
        } catch (err: any) {
            if (err?.message && String(err.message).toLowerCase().includes('limit')) {
                setShowUpgradeModal(true);
            } else {
                setApiError(err);
            }
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteNote = async (noteId: string) => {
        try {
            await apiCall(`/notes/${noteId}`, 'DELETE');
            setNotes(prev => prev.filter(n => n.id !== noteId));
        } catch (err) {
            alert(`Failed to delete note: ${err?.message || err}`);
        }
    };

    const handleUpgrade = async () => {
        setIsUpgrading(true);
        try {
            await apiCall(`/tenants/${user.tenant.slug}/upgrade`, 'POST');
            setCurrentPlan('PRO');
            setShowUpgradeModal(false);
        } catch (err) {
            alert(`Failed to upgrade: ${err?.message || err}`);
        } finally {
            setIsUpgrading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 font-sans">
            <header className="bg-white shadow-sm">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">{user.tenant.name}'s Notes</h1>
                        <p className="text-sm text-gray-500">{user.email} ({user.role}) - <span className={`font-semibold ml-1 ${currentPlan === 'PRO' ? 'text-green-600' : 'text-yellow-600'}`}>{currentPlan} Plan</span></p>
                    </div>
                    <div className="flex items-center gap-4">
                        {user.role === 'ADMIN' && currentPlan !== 'PRO' && (
                             <button onClick={() => setShowUpgradeModal(true)} className="flex items-center gap-2 bg-yellow-400 text-yellow-900 font-semibold py-2 px-4 rounded-lg hover:bg-yellow-500 transition">
                                <ZapIcon className="w-5 h-5"/>
                                <span>Upgrade</span>
                            </button>
                        )}
                        <button onClick={onLogout} className="text-gray-500 hover:text-indigo-600 transition">Logout</button>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <NewNoteForm onCreate={handleCreateNote} isLoading={isCreating} error={apiError && !showUpgradeModal ? apiError : null} />
                {isLoading && notes.length === 0 ? (
                    <div className="text-center py-10">
                       <LoaderIcon className="w-8 h-8 mx-auto text-gray-400" />
                       <p className="mt-2 text-gray-500">Loading notes...</p>
                    </div>
                ) : notes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {notes.map(note => (
                            <NoteCard key={note.id} note={note} onDelete={handleDeleteNote} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-xl shadow-md">
                        <h3 className="text-xl font-semibold text-gray-700">No notes yet</h3>
                        <p className="text-gray-500 mt-2">Create your first note to get started!</p>
                    </div>
                )}
            </main>

            <UpgradeModal show={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} onUpgrade={handleUpgrade} isLoading={isUpgrading} user={user} />
        </div>
    );
};

// --- Login Page ---
const LoginPage: React.FC<any> = ({ onLogin, isLoading }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await onLogin(email, password);
        } catch (err: any) {
            setError(err?.message || 'Login failed. Please check your credentials.');
        }
    };

    const fillTestData = (testEmail: string) => {
        setEmail(testEmail);
        setPassword('password');
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
            <div className="max-w-md w-full mx-auto">
                <h1 className="text-4xl font-bold text-center text-gray-800 mb-2">Notes SaaS</h1>
                <p className="text-center text-gray-500 mb-8">A beautiful, multi-tenant notes app.</p>
                <div className="bg-white p-8 rounded-2xl shadow-lg">
                    <h2 className="text-2xl font-semibold text-gray-700 text-center mb-6">Sign in to your account</h2>
                    <form onSubmit={handleSubmit}>
                        {error && (
                             <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-md" role="alert">
                                <p>{error}</p>
                             </div>
                        )}
                        <div className="mb-4">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                        </div>
                        <div className="mb-6">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-600 mb-1">Password</label>
                            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                        </div>
                        <button type="submit" disabled={isLoading} className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-300 flex items-center justify-center disabled:bg-indigo-400">
                            {isLoading ? <LoaderIcon className="w-5 h-5"/> : 'Login'}
                        </button>
                    </form>
                </div>
                 <div className="mt-6 text-center text-sm text-gray-500">
                    <p className="font-semibold mb-2">Test Accounts (password: `password`)</p>
                    <div className="flex flex-wrap justify-center gap-2">
                        <button onClick={() => fillTestData('admin@acme.test')} className="text-indigo-600 hover:underline">admin@acme.test</button>
                        <button onClick={() => fillTestData('user@acme.test')} className="text-indigo-600 hover:underline">user@acme.test</button>
                        <button onClick={() => fillTestData('admin@globex.test')} className="text-indigo-600 hover:underline">admin@globex.test</button>
                        <button onClick={() => fillTestData('user@globex.test')} className="text-indigo-600 hover:underline">user@globex.test</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Main App Component ---
export default function ModernApp() {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);
    const [page, setPage] = useState<'login'|'dashboard'>('login');
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    useEffect(() => {
        // restore from sessionStorage or localStorage if desired
        const t = localStorage.getItem('token');
        const u = localStorage.getItem('user');
        if (t && u) {
            setToken(t);
            setUser(JSON.parse(u));
            setPage('dashboard');
        }
    }, []);

    const handleLogin = async (email: string, password: string) => {
        setIsLoggingIn(true);
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw data;
            }
            setToken(data.token);
            setUser(data.user);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setPage('dashboard');
        } catch (err) {
            throw err;
        } finally {
            setIsLoggingIn(false);
        }
    };

    const handleLogout = () => {
        setToken(null);
        setUser(null);
        setPage('login');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    if (page === 'login') {
        return <LoginPage onLogin={handleLogin} isLoading={isLoggingIn} />;
    }
    return <Dashboard user={user} token={token} onLogout={handleLogout} />;
}
