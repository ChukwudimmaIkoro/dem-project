'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

function validatePassword(pw: string): string | null {
  if (pw.length < 8)             return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(pw))         return 'Must include an uppercase letter';
  if (!/[a-z]/.test(pw))         return 'Must include a lowercase letter';
  if (!/[0-9]/.test(pw))         return 'Must include a number';
  if (!/[^A-Za-z0-9]/.test(pw))  return 'Must include a special character (!@#$%^&* etc.)';
  return null;
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [done,      setDone]      = useState(false);
  const [ready,     setReady]     = useState(false);

  // Supabase puts the session tokens in the URL hash on redirect.
  // onAuthStateChange fires with SIGNED_IN / PASSWORD_RECOVERY when the
  // client picks them up — wait for that before showing the form.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setReady(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const pwError = validatePassword(password);
    if (pwError) { setError(pwError); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setDone(true);
      setTimeout(() => router.push('/'), 2500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const accent = '#22c55e';
  const accentDark = '#16a34a';

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(160deg, #f0fdf4 0%, #eff6ff 100%)' }}>
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-black" style={{ color: accent }}>Dem</Link>
        </div>

        <div className="bg-white rounded-3xl shadow-sm p-6 space-y-5">
          {done ? (
            <div className="text-center py-4 space-y-3">
              <CheckCircle2 className="w-12 h-12 mx-auto" style={{ color: accent }} />
              <p className="font-black text-gray-900 text-lg">Password updated!</p>
              <p className="text-sm text-gray-500">Taking you back to the app...</p>
            </div>
          ) : !ready ? (
            <div className="text-center py-6 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
              <p className="text-sm text-gray-500">Verifying your reset link...</p>
              <p className="text-xs text-gray-400">If this takes too long, your link may have expired.</p>
              <Link href="/" className="text-xs font-bold hover:underline" style={{ color: accent }}>
                ← Go back to the app
              </Link>
            </div>
          ) : (
            <>
              <div>
                <h1 className="text-lg font-black text-gray-900">Set new password</h1>
                <p className="text-xs text-gray-400 mt-0.5">Choose something strong.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-black text-gray-600 mb-1.5">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Create a strong password"
                      required
                      className="w-full pl-9 pr-4 py-3 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-800 outline-none transition-colors"
                      style={{ borderColor: password ? accent : undefined }}
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1.5 ml-1">
                    8+ chars, uppercase, lowercase, number, special character
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-600 mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="password"
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-9 pr-4 py-3 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-800 outline-none transition-colors"
                      style={{ borderColor: confirm ? accent : undefined }}
                    />
                  </div>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="text-xs font-semibold text-red-500 bg-red-50 rounded-xl px-3 py-2"
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl text-base font-black text-white flex items-center justify-center gap-2"
                  style={{ background: accent, boxShadow: `0 5px 0 0 ${accentDark}`, opacity: loading ? 0.7 : 1 }}
                  whileTap={loading ? {} : { scale: 0.97, y: 2, boxShadow: 'none' }}
                >
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</> : 'Update Password'}
                </motion.button>
              </form>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
