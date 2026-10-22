'use client';

import { useState, useEffect } from 'react';
import TeacherNav from '@/components/TeacherNav';
import {
  Search, CheckCircle, AlertCircle, RefreshCw, Users, UserCheck,
  Activity, ShieldCheck, MapPin, Database, Filter
} from 'lucide-react';

interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  department: string;
  scanTime: string;
  faceVerified: boolean;
  locationVerified: boolean;
  status: string;
}

export default function TeacherAttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [date, setDate] = useState('');

  const fetchAttendance = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await fetch('/api/teacher/attendance');
      const data = await res.json();
      setRecords(data.records || []);
      setDate(data.date || '');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
    const interval = setInterval(() => {
      fetchAttendance();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const departments = Array.from(new Set(records.map(r => r.department))).filter(Boolean);

  const filtered = records.filter(r => {
    const matchSearch =
      !search ||
      r.studentName.toLowerCase().includes(search.toLowerCase()) ||
      r.studentEmail.toLowerCase().includes(search.toLowerCase());
    const matchDept = !deptFilter || r.department === deptFilter;
    return matchSearch && matchDept;
  });

  const presentCount = records.filter(r => r.status === 'Present').length;
  const absentCount = records.length - presentCount;
  const attendanceRate = records.length > 0 ? Math.round((presentCount / records.length) * 100) : 0;

  return (
    <TeacherNav>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 26 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0',
                  borderRadius: 999, padding: '3px 10px',
                }}>
                  <Database size={11} color="#059669" />
                  <span style={{ fontSize: 11, color: '#047857', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Live Attendance Feed
                  </span>
                </div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  backgroundColor: '#eff6ff', border: '1px solid #bfdbfe',
                  borderRadius: 999, padding: '3px 9px',
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#2563eb' }} />
                  <span style={{ fontSize: 11, color: '#1d4ed8', fontWeight: 600 }}>Auto-Refreshing</span>
                </div>
              </div>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
                Live Attendance Monitor
              </h1>
              <p style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>
                {date
                  ? new Date(date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                  : "Today's Attendance Logs"}
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => fetchAttendance(true)}
                disabled={refreshing}
                id="refresh-btn"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '8px 14px', borderRadius: 8,
                  backgroundColor: '#ffffff', border: '1px solid #cbd5e1',
                  color: '#334155', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}
              >
                <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                {refreshing ? 'Syncing...' : 'Sync Now'}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderLeft: '4px solid #2563eb',
            borderRadius: 12,
            padding: 18,
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
              Total Logs
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a' }}>
              {records.length}
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
              Today&apos;s check-ins
            </div>
          </div>

          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderLeft: '4px solid #059669',
            borderRadius: 12,
            padding: 18,
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
              Verified Present
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#059669' }}>
              {presentCount}
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
              Biometrics & GPS valid
            </div>
          </div>

          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderLeft: '4px solid #dc2626',
            borderRadius: 12,
            padding: 18,
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
              Absent / Unverified
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#dc2626' }}>
              {absentCount}
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
              Unmarked or failed checks
            </div>
          </div>

          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderLeft: `4px solid ${attendanceRate >= 75 ? '#059669' : '#d97706'}`,
            borderRadius: 12,
            padding: 18,
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
              Turnout Rate
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: attendanceRate >= 75 ? '#059669' : '#d97706' }}>
              {attendanceRate}%
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
              Average ratio today
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 10,
          padding: 14,
          marginBottom: 18,
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}>
          <div style={{ position: 'relative', flex: '1 1 240px' }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by student name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              id="search-attendance"
              style={{
                width: '100%', padding: '9px 12px 9px 38px', borderRadius: 8,
                border: '1px solid #cbd5e1', backgroundColor: '#ffffff',
                color: '#0f172a', fontSize: 13, outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ minWidth: 200 }}>
            <select
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
              id="dept-filter"
              style={{
                width: '100%', padding: '9px 12px', borderRadius: 8,
                border: '1px solid #cbd5e1', backgroundColor: '#ffffff',
                color: '#0f172a', fontSize: 13, outline: 'none', boxSizing: 'border-box',
              }}
            >
              <option value="">All Departments</option>
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Attendance Records Table */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Student</th>
                  <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Department</th>
                  <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Scan Time</th>
                  <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>GPS Geofence</th>
                  <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Face Recognition</th>
                  <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '50px 20px' }}>
                      <div className="spinner" style={{ margin: '0 auto 10px' }} />
                      <div style={{ color: '#64748b', fontSize: 14 }}>Loading records...</div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '50px 20px', color: '#64748b', fontSize: 14 }}>
                      <Users size={32} color="#94a3b8" style={{ margin: '0 auto 10px', display: 'block' }} />
                      {records.length === 0 ? 'No attendance recorded today yet.' : 'No students match the current filters.'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => (
                    <tr
                      key={r.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                      }}
                    >
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 14 }}>{r.studentName}</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>{r.studentEmail}</div>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{
                          display: 'inline-block',
                          fontSize: 12,
                          fontWeight: 600,
                          padding: '3px 8px',
                          borderRadius: 6,
                          backgroundColor: '#f1f5f9',
                          color: '#475569',
                          border: '1px solid #e2e8f0',
                        }}>
                          {r.department}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', color: '#334155', fontSize: 13, fontFamily: 'monospace' }}>
                        {r.scanTime || '—'}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        {r.locationVerified ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#059669', fontSize: 13, fontWeight: 600 }}>
                            <CheckCircle size={14} color="#059669" /> Verified Within Range
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#dc2626', fontSize: 13, fontWeight: 500 }}>
                            <AlertCircle size={14} color="#dc2626" /> Out of Range
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        {r.faceVerified ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#059669', fontSize: 13, fontWeight: 600 }}>
                            <CheckCircle size={14} color="#059669" /> Biometrics Matched
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#dc2626', fontSize: 13, fontWeight: 500 }}>
                            <AlertCircle size={14} color="#dc2626" /> Unverified
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          padding: '3px 10px',
                          borderRadius: 999,
                          fontSize: 12,
                          fontWeight: 700,
                          backgroundColor: r.status === 'Present' ? '#dcfce7' : '#fee2e2',
                          color: r.status === 'Present' ? '#15803d' : '#b91c1c',
                        }}>
                          <span style={{
                            width: 6, height: 6, borderRadius: '50%',
                            backgroundColor: r.status === 'Present' ? '#16a34a' : '#dc2626',
                          }} />
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </TeacherNav>
  );
}
