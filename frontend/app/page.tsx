'use client';

import Link from 'next/link';
import {
  GraduationCap,
  UserCheck,
  QrCode,
  Shield,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

const features = [
  {
    icon: <QrCode size={22} color="#2563eb" />,
    title: 'Dynamic QR Code',
    desc: 'Time-limited QR codes refreshed per session with instant expiry protection.',
    bg: '#eff6ff',
  },
  {
    icon: <Shield size={22} color="#059669" />,
    title: 'AI Face Verification',
    desc: 'Browser-based face landmark and biometric 128-d descriptor matching.',
    bg: '#ecfdf5',
  },
  {
    icon: <MapPin size={22} color="#d97706" />,
    title: 'GPS Geofencing',
    desc: 'High-accuracy Haversine coordinate validation within classroom boundary.',
    bg: '#fef3c7',
  },
  {
    icon: <Clock size={22} color="#7c3aed" />,
    title: 'Real-Time Records',
    desc: 'Instant attendance calculation, percentage tracking, and report analytics.',
    bg: '#f5f3ff',
  },
];

export default function LandingPage() {
  const teacherBackendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || 'https://smart-attendance-backend.onrender.com/teacher/login';

  return (
    <div className="landing-bg">
      {/* Institutional Top Navbar */}
      <header className="landing-header">
        <div className="logo-badge">
          <div className="logo-icon">
            <GraduationCap size={22} />
          </div>
          <div>
            <div className="logo-text-main">Smart Attendance Management</div>
            <div className="logo-text-sub">Academic Attendance &amp; Biometric Verification Portal</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: '#dcfce7',
            border: '1px solid #bbf7d0',
            borderRadius: 999,
            padding: '4px 12px',
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#16a34a' }} />
            <span style={{ fontSize: 12, color: '#15803d', fontWeight: 600 }}>System Active</span>
          </div>

          <a
            href={teacherBackendUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              fontWeight: 600,
              color: '#059669',
              textDecoration: 'none',
              padding: '6px 14px',
              borderRadius: 6,
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
            }}
          >
            Faculty Portal <ExternalLink size={13} />
          </a>
        </div>
      </header>

      {/* Main Hero Section */}
      <section className="landing-hero">
        <div className="hero-chip">
          <div className="hero-chip-dot" />
          <span>Dynamic QR Code • Face Recognition • GPS Geofencing</span>
        </div>

        <h1 className="hero-title">
          Smart College Attendance<br />
          <span className="hero-title-accent">Verification System</span>
        </h1>

        <p className="hero-sub">
          A secure, multi-factor attendance verification system built for colleges and universities.
          Verify students with dynamic session QR codes, camera biometrics, and GPS coordinates.
        </p>

        {/* Portals Grid */}
        <div className="portal-cards">
          {/* Student Portal Card */}
          <div className="portal-card portal-card-student">
            <div className="portal-icon portal-icon-student">
              <GraduationCap size={28} />
            </div>

            <div className="portal-card-title">Student Portal</div>
            <p className="portal-card-desc">
              Log in to your account, mark session attendance using QR scan and live camera face verification,
              and view your overall attendance percentage.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
              {[
                'Scan classroom QR code to mark attendance',
                'Face recognition & GPS geofence checks',
                'View attendance percentage & session logs',
              ].map((item) => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#475569' }}>
                  <CheckCircle2 size={16} color="#2563eb" style={{ flexShrink: 0 }} />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 'auto' }}>
              <Link
                href="/student/login"
                className="portal-btn portal-btn-student"
                id="student-login-btn"
                style={{ position: 'relative', zIndex: 5 }}
              >
                Student Sign In <ArrowRight size={16} />
              </Link>

              <Link
                href="/student/register"
                className="btn btn-secondary"
                id="student-register-btn"
                style={{ width: '100%', justifyContent: 'center', position: 'relative', zIndex: 5 }}
              >
                Create New Student Account
              </Link>
            </div>
          </div>

          {/* Teacher Portal Card */}
          <div className="portal-card portal-card-teacher">
            <div className="portal-icon portal-icon-teacher">
              <UserCheck size={28} />
            </div>

            <div className="portal-card-title">Faculty &amp; Teacher Portal</div>
            <p className="portal-card-desc">
              Generate dynamic session QR codes with countdown timers and GPS radiuses, monitor live attendance,
              configure semester working days, and download CSV reports.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
              {[
                'Generate dynamic time-limited QR codes',
                'Live attendance feed with biometric status',
                'Student roster & benchmark working days',
                'Department analytics & full CSV export',
              ].map((item) => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#475569' }}>
                  <CheckCircle2 size={16} color="#059669" style={{ flexShrink: 0 }} />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 'auto' }}>
              <a
                href={teacherBackendUrl}
                className="portal-btn portal-btn-teacher"
                id="teacher-login-btn"
                style={{ position: 'relative', zIndex: 5 }}
              >
                Access Teacher Portal <ArrowRight size={16} />
              </a>

              <div className="portal-card-note">
                Hosted on Render Backend • Faculty &amp; Admin login
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section className="features-section">
        <h2 className="features-title">Core System Features</h2>
        <p className="features-sub">
          Three layers of validation to prevent proxy and spoofed attendance
        </p>

        <div className="features-grid">
          {features.map((f) => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon" style={{ background: f.bg }}>
                {f.icon}
              </div>
              <div className="feature-name">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Institutional Footer */}
      <footer className="landing-footer">
        <p>Smart Attendance Management System • Computer Science &amp; Engineering Department</p>
      </footer>
    </div>
  );
}
