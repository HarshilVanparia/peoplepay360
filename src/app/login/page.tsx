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
      callbackUrl: '/',
    });

    if (res?.error) {
      setError('Invalid credentials or inactive account.');
      setLoading(false);
    } else {
      window.location.assign('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-5xl w-full grid md:grid-cols-2 rounded-3xl overflow-hidden border border-violet-300/20 shadow-2xl shadow-violet-950/40 bg-slate-950/70 backdrop-blur-2xl">
        <section className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-violet-600 via-indigo-600 to-slate-950">
          <div><div className="text-sm font-black tracking-[.25em] text-violet-100">PEOPLEPAY360</div><h1 className="mt-8 text-5xl font-bold leading-tight text-white">People operations made clear.</h1><p className="mt-5 text-violet-100 leading-7">One calm workspace for employees contracts attendance time off and payroll.</p></div>
          <div className="rounded-2xl border border-white/20 bg-white/10 p-5 text-sm text-violet-50">Demo access is ready for every role. Use the credential list in this form.</div>
        </section>
        <section className="p-8 md:p-12 space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-violet-600 rounded-xl flex items-center justify-center text-white mb-4 shadow-lg shadow-violet-500/40">
              <Lock size={24} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back</h2>
            <p className="text-sm text-slate-500">Sign in to your operational workspace.</p>
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
              className="w-full bg-violet-600 text-white p-3 rounded-lg hover:bg-violet-500 transition font-medium flex justify-center items-center gap-2 shadow-lg shadow-violet-500/25"
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
        </section>
      </div>
    </div>
  );
}
