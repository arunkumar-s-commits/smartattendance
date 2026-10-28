'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';

export default function StudentLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const res = await fetch('/api/auth/student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({ email, password }),
      });
      clearTimeout(timeoutId);

      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Login failed. Please check your credentials.'); return; }
      router.push('/student/dashboard');
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Server is starting up. Please wait 30 seconds and try again.');
      } else {
        setError('Cannot reach the server. Make sure the backend is running on port 5000.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="student-auth-page">
      <div className="student-auth-card">
        <Link href="/" className="back-link">
          <ArrowLeft size={14} /> Back to Portal Home
        </Link>

        <div className="auth-form-logo">
          <div style={{
            width: 52, height: 52, background: '#eff6ff', border: '1px solid #bfdbfe',
            borderRadius: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 16, color: '#2563eb',
          }}>
            <GraduationCap size={28} />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
            Student Sign In
          </h1>
          <p style={{ fontSize: 14, color: '#64748b' }}>
            Access your attendance records and check-in scanner
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {error && (
            <div className="alert alert-danger">
              <span>{error}</span>
            </div>
          )}

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">College Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                type="email"
                className="form-input"
                style={{ paddingLeft: 38 }}
                placeholder="student@college.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                id="student-email"
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">
              Password <span style={{ color: '#64748b', fontWeight: 400 }}>(your registered mobile number)</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                style={{ paddingLeft: 38, paddingRight: 40 }}
                placeholder="Enter 10-digit mobile number"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                id="student-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8',
                  padding: 4, display: 'flex', alignItems: 'center',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
            id="student-submit-btn"
            style={{ width: '100%', marginTop: 8 }}
          >
            {loading ? <span className="spinner" style={{ borderTopColor: 'white' }} /> : null}
            {loading ? 'Signing in...' : 'Sign In to Student Account'}
          </button>
        </form>

        <div style={{
          marginTop: 24, paddingTop: 20, borderTop: '1px solid #e2e8f0',
          textAlign: 'center', fontSize: 14, color: '#64748b',
        }}>
          Not registered yet?{' '}
          <Link href="/student/register" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>
            Register Student Face ID →
          </Link>
        </div>
      </div>
    </div>
  );
}
