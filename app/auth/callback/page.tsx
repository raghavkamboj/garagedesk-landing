'use client';

import { useEffect, useState } from 'react';

type Status = 'verifying' | 'success' | 'error';

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<Status>('verifying');
  const [message, setMessage] = useState('Verifying your email…');

  useEffect(() => {
    const hash = window.location.hash.startsWith('#')
      ? window.location.hash.slice(1)
      : window.location.hash;
    const params = new URLSearchParams(hash);
    const errorDesc = params.get('error_description');
    const accessToken = params.get('access_token');

    if (errorDesc) {
      setStatus('error');
      setMessage(decodeURIComponent(errorDesc.replace(/\+/g, ' ')));
      return;
    }

    if (accessToken) {
      setStatus('success');
      setMessage('Email verified. Open the Garage Desk app to continue.');
      return;
    }

    setStatus('error');
    setMessage('Verification link is missing or has already been used.');
  }, []);

  const openApp = () => {
    window.location.href = 'garagedesk://auth-callback';
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#FAFAF7] px-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm p-8 text-center">
        <h1 className="text-2xl font-semibold text-[#0E0E0C] tracking-tight mb-3">
          {status === 'verifying' && 'Verifying…'}
          {status === 'success' && 'Email verified'}
          {status === 'error' && 'Verification failed'}
        </h1>
        <p className="text-[#4A4945] mb-6">{message}</p>
        {status === 'success' && (
          <button
            onClick={openApp}
            className="w-full bg-[#0E0E0C] text-[#F5F4EF] rounded-2xl py-3 font-medium"
          >
            Open Garage Desk
          </button>
        )}
      </div>
    </main>
  );
}
