'use client';

import { useEffect, useState } from 'react';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'https://smart-attendance-backend.onrender.com';
const TEACHER_LOGIN = `${BACKEND}/teacher/login`;
const PING_URL = `${BACKEND}/api/seed`;

export default function TeacherPortalWakeup() {
  const [status, setStatus] = useState<'waking' | 'ready' | 'error'>('waking');
  const [dots, setDots] = useState('');
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    const ping = async () => {
      if (cancelled) return;
      attempts++;
      try {
        const controller = new AbortController();
        const t = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(PING_URL, { method: 'GET', signal: controller.signal });
        clearTimeout(t);
        if (res.status < 500) {
          if (!cancelled) {
            setStatus('ready');
            setTimeout(() => { window.location.href = TEACHER_LOGIN; }, 800);
          }
          return;
        }
      } catch { /* still sleeping */ }
      if (attempts >= 20) {
        if (!cancelled) setStatus('error');
        return;
      }
      setTimeout(ping, 3000);
    };
    ping();
    return () => { cancelled = true; };
  }, []);

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#0f172a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Inter, system-ui, sans-serif', padding: 24,
    }}>
      <div style={{
        backgroundColor: '#1e293b', border: '1px solid #334155',
        borderRadius: 16, padding: '48px 40px', maxWidth: 480,
        width: '100%', textAlign: 'center',
        boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          backgroundColor: status === 'ready' ? '#065f46' : status === 'error' ? '#7f1d1d' : '#1d4ed8',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px', fontSize: 28, transition: 'background-color 0.4s',
        }}>
          {status === 'ready' ? '✓' : status === 'error' ? '✕' : '⚡'}
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', marginBottom: 10 }}>
          {status === 'ready' ? 'Server Ready!' : status === 'error' ? 'Server Timeout' : 'Waking Up Server'}
        </h1>

        <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.7, marginBottom: 28 }}>
          {status === 'ready'
            ? 'Redirecting you to the Faculty Portal...'
            : status === 'error'
            ? 'The backend took too long. Please try again in a minute.'
            : `The backend runs on Render free tier and sleeps when idle. It takes 15–30 seconds to wake up. Please wait${dots}`}
        </p>

        {status === 'waking' && (
          <>
            <div style={{ backgroundColor: '#334155', borderRadius: 999, height: 6, overflow: 'hidden', marginBottom: 16 }}>
              <div style={{
                height: '100%', borderRadius: 999, backgroundColor: '#3b82f6',
                width: `${Math.min(seconds * 2, 95)}%`, transition: 'width 1s ease',
              }} />
            </div>
            <p style={{ fontSize: 13, color: '#475569', marginBottom: 24 }}>{seconds}s elapsed</p>
          </>
        )}

        {status === 'error' && (
          <button onClick={() => window.location.reload()} style={{
            backgroundColor: '#2563eb', color: '#fff', border: 'none',
            borderRadius: 8, padding: '10px 24px', fontSize: 14,
            fontWeight: 600, cursor: 'pointer', marginBottom: 16, width: '100%',
          }}>
            Try Again
          </button>
        )}

        <a href={TEACHER_LOGIN} target="_blank" rel="noreferrer"
          style={{ display: 'inline-block', fontSize: 13, color: '#60a5fa', textDecoration: 'none', marginTop: 8 }}>
          Open Faculty Portal directly →
        </a>
      </div>
    </div>
  );
}
