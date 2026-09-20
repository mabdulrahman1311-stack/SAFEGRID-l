/**
 * SAFEGRID Login & Registration Screen
 * Clean, mobile-first authentication with email/password.
 */
import React, { useState } from 'react';
import { Shield, Eye, EyeOff, ArrowRight, UserPlus, LogIn, AlertCircle } from 'lucide-react';
import { login, register } from '../../services/auth';

interface Props {
  onAuthSuccess: (userId: string, email: string, name: string) => void;
}

export const LoginScreen: React.FC<Props> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) { setError('Email is required'); return; }
    if (!password.trim() || password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (mode === 'register' && !name.trim()) { setError('Full name is required'); return; }

    setLoading(true);
    try {
      const result = mode === 'login'
        ? await login(email.trim(), password)
        : await register(email.trim(), password, name.trim());

      if (result.success && result.user) {
        onAuthSuccess(result.user.id, result.user.email, result.user.name);
      } else {
        setError(result.error || 'Authentication failed');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-5 py-8">
      {/* Logo & Branding */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rose-500/30">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">SAFEGRID</h1>
        <p className="text-slate-400 text-sm mt-1">Your Personal Safety Network</p>
      </div>

      {/* Auth Form Card */}
      <div className="w-full max-w-sm">
        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-1 mb-6">
          <button
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              mode === 'login'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <LogIn className="w-4 h-4" /> Sign In
          </button>
          <button
            onClick={() => { setMode('register'); setError(''); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              mode === 'register'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <UserPlus className="w-4 h-4" /> Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field (register only) */}
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Full Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                autoComplete="name"
              />
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Email <span className="text-rose-400">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Password <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="w-full px-4 py-3 pr-12 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:from-rose-600 hover:to-rose-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-rose-500/25"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {mode === 'login' ? 'Sign In' : 'Create Account'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-slate-800/80 text-center">
          <button
            type="button"
            onClick={() => onAuthSuccess('guest_user', 'sarah.lin@example.com', 'Sarah Lin')}
            className="text-xs text-slate-400 hover:text-white font-semibold transition underline decoration-dotted"
          >
            Quick Explore (Demo Mode) →
          </button>
        </div>

        <p className="text-center text-[11px] text-slate-500 mt-4">
          Encrypted &amp; private. Your personal safety data is stored on your device.
        </p>
      </div>
    </div>
  );
};
