'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Status = 'loading' | 'ready' | 'submitting' | 'success' | 'error';

export default function AuthResetPage() {
  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState('Validating reset link…');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  useEffect(() => {
    const hash = window.location.hash.startsWith('#')
      ? window.location.hash.slice(1)
      : window.location.hash;
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    const errorDesc = params.get('error_description');

    if (errorDesc) {
      setStatus('error');
      setMessage(decodeURIComponent(errorDesc.replace(/\+/g, ' ')));
      return;
    }

    if (!accessToken || !refreshToken) {
      setStatus('error');
      setMessage('Reset link is invalid or has already been used.');
      return;
    }

    supabase.auth
      .setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ error }) => {
        if (error) {
          setStatus('error');
          setMessage(error.message);
        } else {
          setStatus('ready');
          setMessage('');
        }
      });
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setMessage('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setMessage('Passwords do not match.');
      return;
    }
    setStatus('submitting');
    setMessage('');
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setStatus('ready');
      setMessage(error.message);
      return;
    }
    setStatus('success');
    setMessage('Password updated. Open the Garage Desk app to sign in.');
  };

  const openApp = () => {
    window.location.href = 'garagedesk://reset-password';
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#FAFAF7] px-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm p-8">
        <h1 className="text-2xl font-semibold text-[#0E0E0C] tracking-tight mb-3 text-center">
          {status === 'success' ? 'Password updated' : 'Reset your password'}
        </h1>

        {status === 'loading' && (
          <p className="text-[#4A4945] text-center">{message}</p>
        )}

        {status === 'error' && (
          <p className="text-[#EF4444] text-center">{message}</p>
        )}

        {(status === 'ready' || status === 'submitting') && (
          <form onSubmit={submit} className="space-y-4">
            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              className="w-full bg-[#F2F0EA] rounded-2xl px-4 py-3 text-[#0E0E0C] outline-none focus:ring-2 focus:ring-[#FF6B35]"
            />
            <input
              type="password"
              placeholder="Confirm password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              required
              className="w-full bg-[#F2F0EA] rounded-2xl px-4 py-3 text-[#0E0E0C] outline-none focus:ring-2 focus:ring-[#FF6B35]"
            />
            {message && (
              <p className="text-[#EF4444] text-sm text-center">{message}</p>
            )}
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full bg-[#0E0E0C] text-[#F5F4EF] rounded-2xl py-3 font-medium disabled:opacity-60"
            >
              {status === 'submitting' ? 'Updating…' : 'Update password'}
            </button>
          </form>
        )}

        {status === 'success' && (
          <>
            <p className="text-[#4A4945] text-center mb-6">{message}</p>
            <button
              onClick={openApp}
              className="w-full bg-[#0E0E0C] text-[#F5F4EF] rounded-2xl py-3 font-medium"
            >
              Open Garage Desk
            </button>
          </>
        )}
      </div>
    </main>
  );
}
