'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  GraduationCap, QrCode, LogOut, Calendar, TrendingUp, AlertTriangle,
  CheckCircle, Clock, X, User, BarChart2, Menu, ShieldCheck, ArrowRight
} from 'lucide-react';

interface AttendanceRecord {
  id: string;
  date: string;
  scanTime: string;
  status: 'Present' | 'Absent';
  faceVerified: boolean;
  locationVerified: boolean;
}

interface AttendanceStats {
  totalDays: number;
  totalPresent: number;
  totalAbsent: number;
  percentage: number;
  todayStatus: string;
  teacherSetDays: number | null;
}

interface StudentProfile {
  id: string;
  name: string;
  email: string;
  department: string;
  photo: string;
}

export default function StudentDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');
  const [filter, setFilter] = useState<'all' | 'present' | 'absent'>('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, attendanceRes] = await Promise.all([
        fetch('/api/student/profile'),
        fetch('/api/student/attendance'),
      ]);
      if (!profileRes.ok) { router.push('/student/login'); return; }
      const profileData = await profileRes.json();
      const attendanceData = await attendanceRes.json();
      setProfile(profileData);
      setStats(attendanceData.stats);
      setRecords(attendanceData.records);
    } catch {
      router.push('/student/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/student/login');
  };

  const pct = stats?.percentage || 0;
  const statusColor = pct >= 75 ? '#16a34a' : pct >= 60 ? '#d97706' : '#dc2626';

  const filteredRecords = records.filter(r => {
    if (filter === 'present') return r.status === 'Present';
    if (filter === 'absent') return r.status === 'Absent';
    return true;
  });

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ width: 36, height: 36, margin: '0 auto 12px' }} />
          <div style={{ color: '#64748b', fontSize: 14 }}>Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  const SidebarContent = () => (
    <>
      <div className="student-sidebar-logo">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, background: '#eff6ff', border: '1px solid #bfdbfe',
            borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#2563eb',
          }}>
            <GraduationCap size={20} />
          </div>
          <div>
            <div style={{ color: '#0f172a', fontWeight: 700, fontSize: 14 }}>Smart Attendance</div>
            <div style={{ color: '#64748b', fontSize: 11 }}>Student Portal</div>
          </div>
        </div>
      </div>

      {profile && (
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {profile.photo ? (
              <img
                src={profile.photo}
                alt="Profile"
                style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #cbd5e1' }}
              />
            ) : (
              <div style={{
                width: 36, height: 36, borderRadius: '50%', background: '#e2e8f0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <User size={18} color="#475569" />
              </div>
            )}
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ color: '#0f172a', fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {profile.name}
              </div>
              <div style={{ color: '#64748b', fontSize: 11 }}>
                {profile.department.split(' ').slice(0, 2).join(' ')}
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className="student-sidebar-nav">
        <button
          onClick={() => { setActiveTab('overview'); setSidebarOpen(false); }}
          className={`student-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
        >
          <BarChart2 size={17} /> <span>Attendance Overview</span>
        </button>

        <button
          onClick={() => { setActiveTab('history'); setSidebarOpen(false); }}
          className={`student-nav-item ${activeTab === 'history' ? 'active' : ''}`}
        >
          <Calendar size={17} /> <span>Session Records</span>
        </button>

        <Link
          href="/student/scan"
          className="student-nav-item"
          onClick={() => setSidebarOpen(false)}
          style={{ color: '#2563eb', fontWeight: 600 }}
        >
          <QrCode size={17} /> <span>Mark Attendance (Scan)</span>
        </Link>
      </nav>

      <div style={{ padding: '16px 12px', borderTop: '1px solid #e2e8f0' }}>
        <button
          onClick={handleLogout}
          className="student-nav-item"
          style={{ color: '#dc2626' }}
        >
          <LogOut size={16} /> <span>Sign Out</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="dashboard-layout">
      {/* Desktop Sidebar */}
      <div className="student-sidebar hidden-mobile">
        <SidebarContent />
      </div>

      {/* Mobile Drawer */}
      {sidebarOpen && (
        <>
          <div
            onClick={() => setSidebarOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }}
          />
          <div style={{
            position: 'fixed', top: 0, left: 0, zIndex: 100,
            width: 270, height: '100vh', background: '#ffffff',
            display: 'flex', flexDirection: 'column', borderRight: '1px solid #e2e8f0',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid #e2e8f0' }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>Menu</span>
              <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>
            <SidebarContent />
          </div>
        </>
      )}

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 24px', background: '#ffffff', borderBottom: '1px solid #e2e8f0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => setSidebarOpen(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0f172a', padding: 4 }}
              className="lg:hidden"
            >
              <Menu size={20} />
            </button>
            <span style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>
              Student Attendance Portal
            </span>
          </div>

          <Link
            href="/student/scan"
            className="btn btn-primary btn-sm"
            id="scan-top-btn"
          >
            <QrCode size={14} /> Scan Classroom QR
          </Link>
        </div>

        <div className="dashboard-content">
          {/* Welcome Banner */}
          <div style={{
            background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12,
            padding: 24, marginBottom: 24, display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', flexWrap: 'wrap', gap: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {profile?.photo ? (
                <img
                  src={profile.photo}
                  alt="Student Profile"
                  style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0' }}
                />
              ) : (
                <div style={{
                  width: 56, height: 56, borderRadius: '50%', background: '#eff6ff',
                  border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <User size={24} color="#2563eb" />
                </div>
              )}
              <div>
                <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a' }}>
                  Hello, {profile?.name || 'Student'}
                </h1>
                <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
                  {profile?.department} • {profile?.email}
                </p>
              </div>
            </div>

            <Link href="/student/scan" className="btn btn-primary">
              <QrCode size={16} /> Mark Today&apos;s Attendance
            </Link>
          </div>

          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <>
              {/* Stat Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
                <div className="card">
                  <div className="stat-label">Total Sessions</div>
                  <div className="stat-value">{stats?.totalDays || 0}</div>
                  <div className="stat-sub">
                    {stats?.teacherSetDays ? 'Configured by teacher' : 'Conducted classes'}
                  </div>
                </div>

                <div className="card">
                  <div className="stat-label">Present</div>
                  <div className="stat-value" style={{ color: '#16a34a' }}>
                    {stats?.totalPresent || 0}
                  </div>
                  <div className="stat-sub">Verified sessions</div>
                </div>

                <div className="card">
                  <div className="stat-label">Absent</div>
                  <div className="stat-value" style={{ color: '#dc2626' }}>
                    {stats?.totalAbsent || 0}
                  </div>
                  <div className="stat-sub">Missed classes</div>
                </div>

                <div className="card">
                  <div className="stat-label">Attendance Rate</div>
                  <div className="stat-value" style={{ color: statusColor }}>
                    {pct}%
                  </div>
                  <div className="stat-sub">
                    {pct >= 75 ? 'Eligible for exams' : pct >= 60 ? 'Warning threshold' : 'Debarred threshold'}
                  </div>
                </div>
              </div>

              {/* Progress & Eligibility Card */}
              <div className="card" style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                    Attendance Requirement Progress
                  </h3>
                  <span style={{ fontSize: 13, fontWeight: 700, color: statusColor }}>
                    {pct}% Current Rate
                  </span>
                </div>

                <div style={{ height: 10, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.min(pct, 100)}%`, height: '100%',
                    background: statusColor, borderRadius: 999, transition: 'width 0.3s',
                  }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, color: '#64748b' }}>
                  <span>0%</span>
                  <span style={{ color: '#dc2626', fontWeight: 600 }}>60% Debarred</span>
                  <span style={{ color: '#16a34a', fontWeight: 600 }}>75% Minimum Required</span>
                  <span>100%</span>
                </div>
              </div>
            </>
          )}

          {/* Session History Table (Tab 2 or overview scroll) */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                Recent Attendance Sessions
              </h3>

              <div style={{ display: 'flex', gap: 6 }}>
                {(['all', 'present', 'absent'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className="btn btn-sm"
                    style={{
                      background: filter === f ? '#2563eb' : '#ffffff',
                      color: filter === f ? '#ffffff' : '#475569',
                      border: '1px solid #cbd5e1',
                    }}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Scan Time</th>
                    <th>Face Verification</th>
                    <th>GPS Geofence</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                        No attendance records found for this filter.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map(r => (
                      <tr key={r.id}>
                        <td style={{ fontWeight: 600, color: '#0f172a' }}>
                          {new Date(r.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td>
                          <span className={`badge ${r.status === 'Present' ? 'badge-success' : 'badge-danger'}`}>
                            {r.status}
                          </span>
                        </td>
                        <td style={{ color: '#64748b', fontSize: 13 }}>
                          {r.scanTime || '—'}
                        </td>
                        <td>
                          {r.faceVerified ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#16a34a', fontSize: 13, fontWeight: 500 }}>
                              <CheckCircle size={14} /> Verified
                            </span>
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: 13 }}>—</span>
                          )}
                        </td>
                        <td>
                          {r.locationVerified ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#16a34a', fontSize: 13, fontWeight: 500 }}>
                              <CheckCircle size={14} /> In Range
                            </span>
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: 13 }}>—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
