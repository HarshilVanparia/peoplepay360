'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Lock } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@peoplepay360.com');
  const [password, setPassword] = useState('demo123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError('Invalid credentials or inactive account.');
      setLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white mb-4">
              <Lock size={24} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">PeoplePay360</h1>
            <p className="text-sm text-slate-500">Sign in to the operational portal.</p>
          </div>

          {error && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">{error}</div>}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Corporate Email</label>
              <input
                type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password" required value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full bg-slate-900 text-white p-3 rounded-lg hover:bg-slate-800 transition font-medium flex justify-center items-center gap-2"
            >
              {loading ? 'Authenticating...' : 'Secure Sign In'} <ArrowRight size={18} />
            </button>
          </form>

          <div className="pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">Demo Credentials (Password: demo123):</p>
            <div className="mt-2 space-y-1 text-xs font-mono text-slate-500">
              <p>Admin: admin@peoplepay360.com</p>
              <p>Employee: john@example.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}