'use client';

import Link from 'next/link';
import { Database, Shield, Users, ArrowRight, Activity, Server, ExternalLink, CheckCircle, FileText } from 'lucide-react';

export default function BackendHomePage() {
  const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc', color: '#0f172a' }}>
      {/* Header */}
      <header style={{
        padding: '16px 36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #e2e8f0',
        backgroundColor: '#ffffff',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38, height: 38,
            backgroundColor: '#059669',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#ffffff',
          }}>
            <Database size={20} />
          </div>
          <div>
            <div style={{ color: '#0f172a', fontWeight: 700, fontSize: 16 }}>
              Smart Attendance System
            </div>
            <div style={{ color: '#64748b', fontSize: 12 }}>
              Faculty Administration &amp; Backend API (Render Service)
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0',
            borderRadius: 999, padding: '4px 12px',
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981' }} />
            <span style={{ fontSize: 12, color: '#047857', fontWeight: 600 }}>API Server Active</span>
          </div>

          <a
            href={frontendUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              color: '#1d4ed8', fontSize: 13, textDecoration: 'none',
              padding: '6px 14px', borderRadius: 6, backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe', fontWeight: 600,
            }}
          >
            Open Student Portal <ExternalLink size={13} />
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
        <div style={{ maxWidth: 860, width: '100%' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0',
              borderRadius: 6, padding: '4px 12px', marginBottom: 16,
              fontSize: 12, fontWeight: 600, color: '#047857', textTransform: 'uppercase', letterSpacing: '0.04em',
            }}>
              <Server size={14} /> Backend &amp; Faculty Management Hub
            </div>

            <h1 style={{
              fontSize: '32px',
              fontWeight: 800,
              color: '#0f172a',
              letterSpacing: '-0.5px',
              marginBottom: 12,
            }}>
              Faculty Administration Portal
            </h1>

            <p style={{ fontSize: 15, color: '#475569', maxWidth: 640, margin: '0 auto', lineHeight: 1.6 }}>
              Centralized server managing attendance sessions, dynamic time-restricted QR code generation,
              facial recognition biometric matching, and semester attendance reporting.
            </p>
          </div>

          {/* Action Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: 24,
            marginBottom: 36,
          }}>
            {/* Faculty Portal Card */}
            <div style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              padding: 28,
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}>
              <div>
                <div style={{
                  width: 44, height: 44, borderRadius: 8,
                  backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
                  color: '#059669',
                }}>
                  <Shield size={22} />
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
                  Faculty Portal Access
                </h2>
                <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.5, marginBottom: 20 }}>
                  Log in as a teacher or administrator to generate dynamic QR codes, track real-time attendance, review student submissions, and configure classes.
                </p>
              </div>

              <div>
                <Link
                  href="/teacher/login"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    backgroundColor: '#059669',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: 14,
                    padding: '11px 20px',
                    borderRadius: 8,
                    textDecoration: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    width: '100%',
                    boxSizing: 'border-box',
                  }}
                  id="backend-teacher-login-btn"
                >
                  Faculty Sign In <ArrowRight size={16} />
                </Link>
                <div style={{ marginTop: 10, fontSize: 12, color: '#94a3b8', textAlign: 'center' }}>
                  Default Credentials: <code>admin@teacher.com</code> / <code>admin2026</code>
                </div>
              </div>
            </div>

            {/* REST API & Health Status Card */}
            <div style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              padding: 28,
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}>
              <div>
                <div style={{
                  width: 44, height: 44, borderRadius: 8,
                  backgroundColor: '#eff6ff', border: '1px solid #bfdbfe',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
                  color: '#2563eb',
                }}>
                  <Activity size={22} />
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
                  REST API Endpoints
                </h2>
                <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.5, marginBottom: 16 }}>
                  Direct HTTP endpoints serving the Vercel student frontend and system integrators:
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: '#334155' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', backgroundColor: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                    <CheckCircle size={15} color="#059669" />
                    <code>POST /api/auth/teacher</code>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', backgroundColor: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                    <CheckCircle size={15} color="#059669" />
                    <code>POST /api/qr/create</code>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', backgroundColor: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                    <CheckCircle size={15} color="#059669" />
                    <code>POST /api/attendance/mark</code>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 20 }}>
                <Link
                  href="/api/seed"
                  target="_blank"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    backgroundColor: '#f1f5f9',
                    color: '#334155',
                    fontWeight: 600,
                    fontSize: 13,
                    padding: '9px 16px',
                    borderRadius: 8,
                    textDecoration: 'none',
                    border: '1px solid #cbd5e1',
                    cursor: 'pointer',
                    width: '100%',
                    boxSizing: 'border-box',
                  }}
                >
                  <FileText size={15} /> Check Seed / System Init
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Notice */}
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            padding: '14px 18px',
            fontSize: 13,
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div>
              <strong>Architecture notice:</strong> For students marking attendance, please direct them to the <a href={frontendUrl} target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontWeight: 600 }}>Frontend Vercel Application</a>.
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer style={{
        padding: '16px 36px',
        textAlign: 'center',
        borderTop: '1px solid #e2e8f0',
        backgroundColor: '#ffffff',
        color: '#64748b',
        fontSize: 13,
      }}>
        Smart Attendance System &copy; 2026 · Academic Department Portal
      </footer>
    </div>
  );
}
