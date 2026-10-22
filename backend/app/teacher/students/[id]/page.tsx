'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import TeacherNav from '@/components/TeacherNav';
import {
  ArrowLeft, User, AlertTriangle, CheckCircle, Calendar,
  Database, ShieldAlert, Sparkles, Clock, MapPin, Check
} from 'lucide-react';

interface AttendanceRecord {
  id: string;
  date: string;
  scanTime: string;
  status: string;
  faceVerified: boolean;
  locationVerified: boolean;
}

interface StudentDetail {
  student: {
    id: string;
    name: string;
    email: string;
    department: string;
    photo: string;
    createdAt: string;
  };
  attendance: {
    totalDays: number;
    totalPresent: number;
    totalAbsent: number;
    percentage: number;
    records: AttendanceRecord[];
  };
}

const LS_KEY = 'teacher_total_working_days';

export default function StudentDetailPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const [data, setData] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'present' | 'absent'>('all');

  const urlTotalDays = searchParams.get('totalDays');
  const resolvedTotalDays = (() => {
    if (urlTotalDays) {
      const n = parseInt(urlTotalDays, 10);
      if (n > 0) return n;
    }
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const n = parseInt(saved, 10);
        if (n > 0) return n;
      }
    }
    return null;
  })();

  useEffect(() => {
    const td = (() => {
      if (urlTotalDays) {
        const n = parseInt(urlTotalDays, 10);
        if (n > 0) return n;
      }
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const n = parseInt(saved, 10);
        if (n > 0) return n;
      }
      return null;
    })();

    const url = td ? `/api/teacher/students/${params.id}?totalDays=${td}` : `/api/teacher/students/${params.id}`;
    fetch(url)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [params.id, urlTotalDays]);

  if (loading) {
    return (
      <TeacherNav>
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="spinner" style={{ width: 40, height: 40, borderTopColor: '#10b981' }} />
        </div>
      </TeacherNav>
    );
  }

  if (!data || !data.student) {
    return (
      <TeacherNav>
        <div className="dashboard-content">
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 14, padding: 24, textAlign: 'center', color: '#fca5a5',
          }}>
            <AlertTriangle size={32} color="#ef4444" style={{ margin: '0 auto 12px' }} />
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Student Profile Not Found</h2>
            <Link href="/teacher/students" className="btn btn-glass btn-sm" style={{ marginTop: 12 }}>
              <ArrowLeft size={14} /> Back to Directory
            </Link>
          </div>
        </div>
      </TeacherNav>
    );
  }

  const { student, attendance } = data;
  const pct = attendance.percentage;
  const progressColor = pct >= 75 ? '#34d399' : pct >= 60 ? '#fbbf24' : '#f87171';
  const barGradient = pct >= 75
    ? 'linear-gradient(90deg, #059669, #10b981)'
    : pct >= 60
    ? 'linear-gradient(90deg, #d97706, #f59e0b)'
    : 'linear-gradient(90deg, #b91c1c, #ef4444)';

  const filteredRecords = attendance.records.filter(r => {
    if (filter === 'present') return r.status === 'Present';
    if (filter === 'absent') return r.status === 'Absent';
    return true;
  });

  const backHref = resolvedTotalDays
    ? `/teacher/students?totalDays=${resolvedTotalDays}`
    : '/teacher/students';

  return (
    <TeacherNav>
      <div className="dashboard-content">
        {/* Back Link */}
        <div style={{ marginBottom: 20 }}>
          <Link
            href={backHref}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              color: 'rgba(255,255,255,0.6)', fontSize: 13, textDecoration: 'none',
              background: 'rgba(255,255,255,0.05)', padding: '6px 14px', borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.08)', transition: 'all 0.2s',
            }}
          >
            <ArrowLeft size={14} /> Back to Students Directory
          </Link>
        </div>

        {/* Total days notice banner */}
        {resolvedTotalDays && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)',
            borderRadius: 12, padding: '12px 18px', marginBottom: 24, fontSize: 13, color: '#a7f3d0',
          }}>
            <Calendar size={16} color="#34d399" />
            <span>
              Attendance percentages are calculated based on <strong>{resolvedTotalDays} total working days</strong> configured by the instructor.
            </span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginBottom: 28 }}>
          {/* Student Profile Card */}
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16,
            padding: 28,
            backdropFilter: 'blur(10px)',
          }}>
            <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start', marginBottom: 20 }}>
              {student.photo ? (
                <img
                  src={student.photo}
                  alt={student.name}
                  style={{
                    width: 76, height: 76, borderRadius: '50%',
                    objectFit: 'cover', border: '2px solid rgba(16,185,129,0.4)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.3)', flexShrink: 0,
                  }}
                />
              ) : (
                <div style={{
                  width: 76, height: 76, borderRadius: '50%',
                  background: 'rgba(99,102,241,0.15)', border: '2px solid rgba(99,102,241,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <User size={32} color="#818cf8" />
                </div>
              )}
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: 'white', marginBottom: 4, fontFamily: 'Outfit, sans-serif' }}>
                  {student.name}
                </h2>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>
                  {student.email}
                </p>
                <span style={{
                  display: 'inline-block',
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '3px 10px',
                  borderRadius: 6,
                  background: 'rgba(99,102,241,0.15)',
                  color: '#a5b4fc',
                  border: '1px solid rgba(99,102,241,0.25)',
                }}>
                  {student.department}
                </span>
              </div>
            </div>

            <div style={{
              borderTop: '1px solid rgba(255,255,255,0.06)',
              paddingTop: 16, fontSize: 12, color: 'rgba(255,255,255,0.35)',
              display: 'flex', justifyContent: 'space-between',
            }}>
              <span>Enrollment Date:</span>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
                {new Date(student.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Attendance Summary Card */}
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16,
            padding: 28,
            backdropFilter: 'blur(10px)',
          }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'white', marginBottom: 16 }}>
              Attendance Benchmark Overview
            </h3>

            {pct < 60 && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', borderRadius: 10, marginBottom: 16,
                background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
                color: '#fca5a5', fontSize: 13,
              }}>
                <ShieldAlert size={16} color="#ef4444" />
                <span><strong>Critically Low:</strong> Below minimum exam threshold (60%).</span>
              </div>
            )}
            {pct >= 60 && pct < 75 && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', borderRadius: 10, marginBottom: 16,
                background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)',
                color: '#fcd34d', fontSize: 13,
              }}>
                <AlertTriangle size={16} color="#fbbf24" />
                <span><strong>Warning:</strong> Below standard 75% requirement.</span>
              </div>
            )}
            {pct >= 75 && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', borderRadius: 10, marginBottom: 16,
                background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)',
                color: '#86efac', fontSize: 13,
              }}>
                <CheckCircle size={16} color="#34d399" />
                <span><strong>Satisfactory:</strong> Eligible for regular examinations.</span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 14, textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'white', fontFamily: 'Outfit, sans-serif' }}>
                  {attendance.totalDays}
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>
                  Total Sessions
                  {resolvedTotalDays && <span style={{ display: 'block', fontSize: 10, color: '#34d399', fontWeight: 600 }}>Teacher-set</span>}
                </div>
              </div>

              <div style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 10, padding: 14, textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#34d399', fontFamily: 'Outfit, sans-serif' }}>
                  {attendance.totalPresent}
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>
                  Present
                </div>
              </div>

              <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: 14, textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#f87171', fontFamily: 'Outfit, sans-serif' }}>
                  {attendance.totalAbsent}
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>
                  Absent
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 14, textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: progressColor, fontFamily: 'Outfit, sans-serif' }}>
                  {pct}%
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>
                  Attendance Rate
                </div>
              </div>
            </div>

            <div style={{ height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: barGradient, borderRadius: 999 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>0%</span>
              <span style={{ fontSize: 11, color: '#f87171', fontWeight: 600 }}>60% Debarred</span>
              <span style={{ fontSize: 11, color: '#fbbf24', fontWeight: 600 }}>75% Eligible</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>100%</span>
            </div>
          </div>
        </div>

        {/* Attendance History Section */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16,
          padding: 24,
          backdropFilter: 'blur(10px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'white', fontFamily: 'Outfit, sans-serif' }}>
              Individual Session History
            </h3>
            <div style={{ display: 'flex', gap: 6, background: 'rgba(255,255,255,0.05)', padding: 4, borderRadius: 10 }}>
              {(['all', 'present', 'absent'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: 'none',
                    background: filter === f ? 'linear-gradient(135deg, #059669, #10b981)' : 'transparent',
                    color: filter === f ? 'white' : 'rgba(255,255,255,0.5)',
                    transition: 'all 0.2s',
                  }}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                  <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                  <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Scan Time</th>
                  <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Face Verified</th>
                  <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Location Verified</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '40px 18px', color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
                      No attendance records found for this filter.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((r, i) => (
                    <tr
                      key={r.id}
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                      }}
                    >
                      <td style={{ padding: '14px 18px', fontWeight: 500, color: 'white', fontSize: 14 }}>
                        {new Date(r.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                          background: r.status === 'Present' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                          color: r.status === 'Present' ? '#86efac' : '#fca5a5',
                          border: `1px solid ${r.status === 'Present' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                        }}>
                          {r.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', color: 'rgba(255,255,255,0.6)', fontSize: 13, fontFamily: 'monospace' }}>
                        {r.scanTime || '—'}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        {r.faceVerified ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#34d399', fontSize: 13 }}>
                            <CheckCircle size={14} /> Verified
                          </span>
                        ) : (
                          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        {r.locationVerified ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#34d399', fontSize: 13 }}>
                            <CheckCircle size={14} /> Verified
                          </span>
                        ) : (
                          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>—</span>
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
    </TeacherNav>
  );
}
