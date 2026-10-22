'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TeacherNav from '@/components/TeacherNav';
import {
  Users, UserCheck, UserX, TrendingUp, QrCode, RefreshCw, Calendar,
  Activity, ArrowUpRight, Database, Zap
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const LS_KEY = 'teacher_total_working_days';

interface DashboardData {
  totalStudents: number;
  presentToday: number;
  absentToday: number;
  attendanceRate: number;
  recentAttendance: { _id: string; count: number }[];
}

export default function TeacherDashboard() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalDaysInput, setTotalDaysInput] = useState('');
  const [appliedTotalDays, setAppliedTotalDays] = useState<number | null>(null);
  const [daysMessage, setDaysMessage] = useState('');
  const [savingDays, setSavingDays] = useState(false);

  useEffect(() => {
    fetch('/api/teacher/settings')
      .then(r => r.json())
      .then(d => {
        const n = d.totalWorkingDays;
        if (n && n > 0) {
          setAppliedTotalDays(n);
          setTotalDaysInput(String(n));
          localStorage.setItem(LS_KEY, String(n));
        }
      })
      .catch(() => {
        const saved = localStorage.getItem(LS_KEY);
        if (saved) {
          const n = parseInt(saved, 10);
          if (n > 0) { setAppliedTotalDays(n); setTotalDaysInput(saved); }
        }
      });
  }, []);

  const handleApplyDays = async () => {
    const n = parseInt(totalDaysInput, 10);
    if (!totalDaysInput || isNaN(n) || n <= 0) { setDaysMessage('Enter a valid number.'); return; }
    setSavingDays(true);
    try {
      await fetch('/api/teacher/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ totalWorkingDays: n }),
      });
      localStorage.setItem(LS_KEY, String(n));
      setAppliedTotalDays(n);
      setDaysMessage(`✓ Saved! Percentages now calculated out of ${n} days.`);
    } catch {
      setDaysMessage('Failed to save.');
    } finally {
      setSavingDays(false);
      setTimeout(() => setDaysMessage(''), 4000);
    }
  };

  const handleClearDays = async () => {
    setSavingDays(true);
    try {
      await fetch('/api/teacher/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ totalWorkingDays: null }),
      });
      localStorage.removeItem(LS_KEY);
      setAppliedTotalDays(null);
      setTotalDaysInput('');
      setDaysMessage('Reset to automatic mode.');
    } catch {
      setDaysMessage('Failed to reset.');
    } finally {
      setSavingDays(false);
      setTimeout(() => setDaysMessage(''), 3000);
    }
  };

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await fetch('/api/teacher/dashboard');
      if (!res.ok) { router.push('/teacher/login'); return; }
      const json = await res.json();
      setData(json);
    } catch {
      router.push('/teacher/login');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const chartData = data?.recentAttendance.map(r => ({
    date: new Date(r._id).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
    present: r.count,
  })) || [];

  const pieData = data ? [
    { name: 'Present', value: data.presentToday },
    { name: 'Absent', value: data.absentToday },
  ] : [];

  const stats = [
    {
      label: 'Total Students',
      value: data?.totalStudents || 0,
      sub: 'Enrolled',
      color: '#2563eb',
      bg: '#eff6ff',
      icon: <Users size={20} color="#2563eb" />,
    },
    {
      label: 'Present Today',
      value: data?.presentToday || 0,
      sub: 'Marked in sessions',
      color: '#059669',
      bg: '#ecfdf5',
      icon: <UserCheck size={20} color="#059669" />,
    },
    {
      label: 'Absent Today',
      value: data?.absentToday || 0,
      sub: 'Unmarked',
      color: '#dc2626',
      bg: '#fef2f2',
      icon: <UserX size={20} color="#dc2626" />,
    },
    {
      label: 'Attendance Rate',
      value: `${data?.attendanceRate || 0}%`,
      sub: 'Today Average',
      color: (data?.attendanceRate ?? 0) >= 75 ? '#059669' : '#d97706',
      bg: (data?.attendanceRate ?? 0) >= 75 ? '#ecfdf5' : '#fffbeb',
      icon: <TrendingUp size={20} color={(data?.attendanceRate ?? 0) >= 75 ? '#059669' : '#d97706'} />,
    },
  ];

  if (loading) {
    return (
      <TeacherNav>
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div className="spinner" style={{ width: 36, height: 36, margin: '0 auto 16px' }} />
            <p style={{ color: '#64748b', fontSize: 14 }}>Loading faculty data...</p>
          </div>
        </div>
      </TeacherNav>
    );
  }

  return (
    <TeacherNav>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0',
                borderRadius: 999, padding: '3px 10px', marginBottom: 8,
              }}>
                <Database size={12} color="#059669" />
                <span style={{ fontSize: 11, color: '#047857', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Faculty Dashboard</span>
              </div>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
                Attendance Control Center
              </h1>
              <p style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => fetchData(true)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '8px 14px', borderRadius: 8,
                  backgroundColor: '#ffffff', border: '1px solid #cbd5e1',
                  color: '#334155', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}
                disabled={refreshing}
              >
                <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                Refresh
              </button>
              <a
                href="/teacher/qr-generator"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '8px 16px', borderRadius: 8,
                  backgroundColor: '#059669', color: '#ffffff',
                  fontSize: 13, fontWeight: 600, textDecoration: 'none',
                }}
              >
                <QrCode size={15} /> Generate QR
              </a>
            </div>
          </div>
        </div>

        {/* Total Working Days Config Card */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          padding: 20,
          marginBottom: 28,
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
            <div style={{
              width: 42, height: 42, backgroundColor: '#eff6ff', borderRadius: 8, border: '1px solid #bfdbfe',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Calendar size={20} color="#2563eb" />
            </div>
            <div style={{ flex: 1, minWidth: 260 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', marginBottom: 4 }}>
                Configure Semester Total Working Days
                {appliedTotalDays && (
                  <span style={{ marginLeft: 10, fontSize: 12, color: '#059669', fontWeight: 600, backgroundColor: '#ecfdf5', padding: '2px 8px', borderRadius: 4 }}>
                    Active: {appliedTotalDays} days
                  </span>
                )}
              </div>
              <p style={{ fontSize: 13, color: '#64748b', marginBottom: 12, lineHeight: 1.4 }}>
                Set the total working days for the semester. Student attendance percentages will be calculated relative to this target.
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                  id="dashboard-total-days-input"
                  type="number" min="1" max="365"
                  style={{
                    width: 140, padding: '8px 12px', borderRadius: 8,
                    border: '1px solid #cbd5e1', backgroundColor: '#ffffff',
                    color: '#0f172a', fontSize: 14, outline: 'none',
                  }}
                  placeholder="e.g. 60"
                  value={totalDaysInput}
                  onChange={e => setTotalDaysInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleApplyDays()}
                  disabled={savingDays}
                />
                <button
                  id="dashboard-apply-days-btn"
                  style={{
                    backgroundColor: '#059669', color: '#ffffff',
                    border: 'none', borderRadius: 8, padding: '8px 14px',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                  }}
                  onClick={handleApplyDays}
                  disabled={savingDays}
                >
                  <Zap size={13} />
                  {savingDays ? 'Saving…' : 'Save & Apply'}
                </button>
                {appliedTotalDays && (
                  <button
                    style={{
                      backgroundColor: '#ffffff', color: '#64748b',
                      border: '1px solid #cbd5e1', borderRadius: 8, padding: '8px 14px',
                      fontSize: 13, fontWeight: 500, cursor: 'pointer',
                    }}
                    onClick={handleClearDays}
                    disabled={savingDays}
                  >
                    Reset to Auto
                  </button>
                )}
                <a
                  href="/teacher/students"
                  style={{
                    color: '#2563eb', fontSize: 13, fontWeight: 600,
                    textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4,
                  }}
                >
                  View Students <ArrowUpRight size={14} />
                </a>
              </div>
              {daysMessage && (
                <div style={{ marginTop: 8, fontSize: 13, color: daysMessage.startsWith('✓') ? '#059669' : '#d97706', fontWeight: 600 }}>
                  {daysMessage}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 18,
          marginBottom: 28,
        }}>
          {stats.map(s => (
            <div
              key={s.label}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderLeft: `4px solid ${s.color}`,
                borderRadius: 12,
                padding: '20px 22px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: s.color, margin: '6px 0 2px' }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>
                    {s.sub}
                  </div>
                </div>
                <div style={{ width: 44, height: 44, backgroundColor: s.bg, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {s.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20, marginBottom: 28 }}>
          {/* Bar Chart */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: 24,
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Activity size={17} color="#059669" /> Attendance - Last 7 Days
            </h3>
            {chartData.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 0', fontSize: 14 }}>
                No attendance recorded yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} stroke="#cbd5e1" />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} stroke="#cbd5e1" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, color: '#0f172a' }}
                  />
                  <Bar dataKey="present" fill="#059669" radius={[4, 4, 0, 0]} name="Present Students" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Pie Chart */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: 24,
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={17} color="#059669" /> Today&apos;s Ratio
            </h3>
            {(data?.presentToday || 0) + (data?.absentToday || 0) === 0 ? (
              <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 0', fontSize: 14 }}>
                No student activity today
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={210}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%" cy="50%"
                    outerRadius={70}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    <Cell fill="#059669" />
                    <Cell fill="#dc2626" />
                  </Pie>
                  <Legend
                    formatter={(value) => <span style={{ color: '#475569', fontSize: 13, fontWeight: 500 }}>{value}</span>}
                  />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, color: '#0f172a' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Quick Actions Card */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          padding: 24,
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Zap size={16} color="#d97706" /> Quick Faculty Actions
          </h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a
              href="/teacher/qr-generator"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '9px 16px', borderRadius: 8,
                backgroundColor: '#059669', color: '#ffffff',
                fontSize: 13, fontWeight: 600, textDecoration: 'none',
              }}
            >
              <QrCode size={16} /> Generate Attendance QR
            </a>
            <a
              href="/teacher/attendance"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '9px 16px', borderRadius: 8,
                backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#334155',
                fontSize: 13, fontWeight: 600, textDecoration: 'none',
              }}
            >
              <Activity size={16} color="#059669" /> View Live Attendance
            </a>
            <a
              href="/teacher/students"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '9px 16px', borderRadius: 8,
                backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#334155',
                fontSize: 13, fontWeight: 600, textDecoration: 'none',
              }}
            >
              <Users size={16} color="#2563eb" /> Manage Students
            </a>
            <a
              href="/teacher/reports"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '9px 16px', borderRadius: 8,
                backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#334155',
                fontSize: 13, fontWeight: 600, textDecoration: 'none',
              }}
            >
              <TrendingUp size={16} color="#d97706" /> Export Reports
            </a>
          </div>
        </div>
      </div>
    </TeacherNav>
  );
}
