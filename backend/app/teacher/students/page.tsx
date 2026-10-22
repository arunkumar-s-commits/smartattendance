'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import TeacherNav from '@/components/TeacherNav';
import {
  Search, User, AlertTriangle, CheckCircle, Calendar, RefreshCw,
  Database, Users, ShieldAlert, ArrowRight
} from 'lucide-react';

interface StudentSummary {
  id: string;
  name: string;
  email: string;
  department: string;
  photo: string;
  presentDays: number;
  totalDays: number;
  percentage: number;
}

const LS_KEY = 'teacher_total_working_days';

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  // Total working days state
  const [totalDaysInput, setTotalDaysInput] = useState('');
  const [appliedTotalDays, setAppliedTotalDays] = useState<number | null>(null);
  const [applyMessage, setApplyMessage] = useState('');
  const [savingDays, setSavingDays] = useState(false);

  // Load from DB on mount
  useEffect(() => {
    fetch('/api/teacher/settings')
      .then(r => r.json())
      .then(d => {
        const n = d.totalWorkingDays;
        if (n && n > 0) {
          setTotalDaysInput(String(n));
          setAppliedTotalDays(n);
          localStorage.setItem(LS_KEY, String(n));
        }
      })
      .catch(() => {
        const saved = localStorage.getItem(LS_KEY);
        if (saved) {
          const n = parseInt(saved, 10);
          if (n > 0) { setTotalDaysInput(saved); setAppliedTotalDays(n); }
        }
      });
  }, []);

  const fetchStudents = useCallback(async (totalDays: number | null) => {
    setLoading(true);
    const url = totalDays && totalDays > 0
      ? `/api/teacher/students?totalDays=${totalDays}`
      : '/api/teacher/students';
    try {
      const r = await fetch(url);
      const d = await r.json();
      setStudents(d.students || []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents(appliedTotalDays);
  }, [appliedTotalDays, fetchStudents]);

  const handleApplyDays = async () => {
    const n = parseInt(totalDaysInput, 10);
    if (!totalDaysInput || isNaN(n) || n <= 0) {
      setApplyMessage('Please enter a valid positive number.');
      return;
    }
    setSavingDays(true);
    try {
      await fetch('/api/teacher/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ totalWorkingDays: n }),
      });
      localStorage.setItem(LS_KEY, String(n));
      setAppliedTotalDays(n);
      setApplyMessage(`✓ Saved! All reports and student views now use ${n} total days.`);
    } catch {
      setApplyMessage('Failed to save settings. Please try again.');
    } finally {
      setSavingDays(false);
      setTimeout(() => setApplyMessage(''), 4000);
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
      setApplyMessage('Reset to automatic mode (counted from unique class sessions).');
    } catch {
      setApplyMessage('Failed to reset. Please try again.');
    } finally {
      setSavingDays(false);
      setTimeout(() => setApplyMessage(''), 3000);
    }
  };

  const departments = Array.from(new Set(students.map(s => s.department))).filter(Boolean);

  const filtered = students.filter(s => {
    const matchSearch =
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    const matchDept = !deptFilter || s.department === deptFilter;
    return matchSearch && matchDept;
  });

  const lowAttendance = students.filter(s => s.percentage < 60).length;
  const goodAttendance = students.filter(s => s.percentage >= 75).length;

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
                    Student Directory
                  </span>
                </div>
              </div>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
                Enrolled Students
              </h1>
              <p style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>
                {students.length} students enrolled across departments
              </p>
            </div>

            <button
              onClick={() => fetchStudents(appliedTotalDays)}
              disabled={loading}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 8,
                backgroundColor: '#ffffff', border: '1px solid #cbd5e1',
                color: '#334155', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>
        </div>

        {/* Total Working Days Banner */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          padding: 20,
          marginBottom: 24,
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
            <div style={{
              width: 44, height: 44,
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Calendar size={22} color="#059669" />
            </div>

            <div style={{ flex: 1, minWidth: 260 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                <span style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>
                  Semester Working Days Benchmark
                </span>
                {appliedTotalDays && (
                  <span style={{
                    fontSize: 12,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 6,
                    backgroundColor: '#ecfdf5',
                    color: '#047857',
                    border: '1px solid #a7f3d0',
                  }}>
                    Active: {appliedTotalDays} Days
                  </span>
                )}
              </div>
              <p style={{ fontSize: 13, color: '#64748b', marginBottom: 12, lineHeight: 1.5 }}>
                Configure the total class sessions conducted so far. Student percentages on both the faculty portal and student frontend will recalculate against this benchmark.
              </p>

              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  id="total-working-days-input"
                  type="number"
                  min="1"
                  max="365"
                  style={{
                    width: 140, padding: '8px 12px', borderRadius: 8,
                    border: '1px solid #cbd5e1', backgroundColor: '#ffffff',
                    color: '#0f172a', fontSize: 14, fontWeight: 700, outline: 'none',
                  }}
                  placeholder="e.g. 60"
                  value={totalDaysInput}
                  onChange={e => setTotalDaysInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleApplyDays()}
                  disabled={savingDays}
                />
                <button
                  id="apply-total-days-btn"
                  onClick={handleApplyDays}
                  disabled={savingDays}
                  style={{
                    backgroundColor: '#059669', color: '#ffffff',
                    border: 'none', borderRadius: 8, padding: '8px 14px',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                  }}
                >
                  <RefreshCw size={13} className={savingDays ? 'animate-spin' : ''} />
                  {savingDays ? 'Saving...' : 'Apply Benchmark'}
                </button>
                {appliedTotalDays && (
                  <button
                    id="reset-total-days-btn"
                    onClick={handleClearDays}
                    disabled={savingDays}
                    style={{
                      backgroundColor: '#ffffff', color: '#64748b',
                      border: '1px solid #cbd5e1', borderRadius: 8, padding: '8px 14px',
                      fontSize: 13, fontWeight: 500, cursor: 'pointer',
                    }}
                  >
                    Reset to Auto
                  </button>
                )}
              </div>

              {applyMessage && (
                <div style={{
                  marginTop: 10, fontSize: 13, fontWeight: 600,
                  color: applyMessage.startsWith('✓') ? '#059669' : '#d97706',
                }}>
                  {applyMessage}
                </div>
              )}
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
              Total Students
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a' }}>
              {students.length}
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
              Registered accounts
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
              Eligible (≥75%)
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#059669' }}>
              {goodAttendance}
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
              In good standing
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
              Critical Risk (&lt;60%)
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#dc2626' }}>
              {lowAttendance}
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
              Needs counseling
            </div>
          </div>

          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderLeft: '4px solid #d97706',
            borderRadius: 12,
            padding: 18,
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
              Benchmark Days
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#d97706' }}>
              {appliedTotalDays ?? (students[0]?.totalDays ?? '—')}
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
              {appliedTotalDays ? 'Manual setting' : 'Auto computed'}
            </div>
          </div>
        </div>

        {lowAttendance > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 18px', borderRadius: 8, marginBottom: 20,
            backgroundColor: '#fef2f2', border: '1px solid #fecaca',
            color: '#b91c1c', fontSize: 13,
          }}>
            <ShieldAlert size={18} color="#dc2626" style={{ flexShrink: 0 }} />
            <span>
              <strong>Warning: {lowAttendance} student{lowAttendance > 1 ? 's' : ''}</strong> have attendance below 60% and are at risk of exam debarment.
            </span>
          </div>
        )}

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
              id="student-search"
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
              id="student-dept-filter"
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

        {/* Students Table */}
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
                  <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Present Days</th>
                  <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Benchmark Total</th>
                  <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', minWidth: 160 }}>Attendance %</th>
                  <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Status</th>
                  <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '50px 20px' }}>
                      <div className="spinner" style={{ margin: '0 auto 10px' }} />
                      <div style={{ color: '#64748b', fontSize: 14 }}>Loading students...</div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '50px 20px', color: '#64748b', fontSize: 14 }}>
                      <Users size={32} color="#94a3b8" style={{ margin: '0 auto 10px', display: 'block' }} />
                      {students.length === 0 ? 'No students enrolled yet.' : 'No students match the current filters.'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((s) => {
                    const color = s.percentage >= 75 ? '#059669' : s.percentage >= 60 ? '#d97706' : '#dc2626';
                    const barBg = s.percentage >= 75 ? '#059669' : s.percentage >= 60 ? '#d97706' : '#dc2626';

                    return (
                      <tr
                        key={s.id}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                        }}
                      >
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            {s.photo ? (
                              <img
                                src={s.photo}
                                alt={s.name}
                                style={{
                                  width: 36, height: 36, borderRadius: '50%',
                                  objectFit: 'cover', border: '1.5px solid #cbd5e1',
                                }}
                              />
                            ) : (
                              <div style={{
                                width: 36, height: 36, borderRadius: '50%',
                                backgroundColor: '#f1f5f9',
                                border: '1px solid #cbd5e1',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}>
                                <User size={18} color="#64748b" />
                              </div>
                            )}
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 14, color: '#0f172a' }}>{s.name}</div>
                              <div style={{ fontSize: 12, color: '#64748b' }}>{s.email}</div>
                            </div>
                          </div>
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
                            {s.department}
                          </span>
                        </td>

                        <td style={{ padding: '14px 18px', fontWeight: 700, color: '#059669', fontSize: 14 }}>
                          {s.presentDays}
                        </td>

                        <td style={{ padding: '14px 18px', color: '#334155', fontSize: 13 }}>
                          {s.totalDays}
                          {appliedTotalDays && (
                            <span style={{
                              marginLeft: 6, fontSize: 10, padding: '1px 6px',
                              borderRadius: 4, backgroundColor: '#ecfdf5', color: '#047857', fontWeight: 600,
                            }}>
                              manual
                            </span>
                          )}
                        </td>

                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ flex: 1, height: 6, backgroundColor: '#e2e8f0', borderRadius: 999, overflow: 'hidden' }}>
                              <div style={{ width: `${Math.min(s.percentage, 100)}%`, height: '100%', backgroundColor: barBg, borderRadius: 999 }} />
                            </div>
                            <span style={{ fontWeight: 700, color, fontSize: 13, minWidth: 40, textAlign: 'right' }}>
                              {s.percentage}%
                            </span>
                          </div>
                        </td>

                        <td style={{ padding: '14px 18px' }}>
                          {s.percentage >= 75 ? (
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: 4,
                              padding: '3px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                              backgroundColor: '#dcfce7', color: '#15803d',
                            }}>
                              <CheckCircle size={12} /> Eligible
                            </span>
                          ) : s.percentage >= 60 ? (
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: 4,
                              padding: '3px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                              backgroundColor: '#fef3c7', color: '#b45309',
                            }}>
                              <AlertTriangle size={12} /> Warning
                            </span>
                          ) : (
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: 4,
                              padding: '3px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                              backgroundColor: '#fee2e2', color: '#b91c1c',
                            }}>
                              <AlertTriangle size={12} /> Debarred
                            </span>
                          )}
                        </td>

                        <td style={{ padding: '14px 18px' }}>
                          <Link
                            href={appliedTotalDays ? `/teacher/students/${s.id}?totalDays=${appliedTotalDays}` : `/teacher/students/${s.id}`}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 4,
                              padding: '5px 10px', borderRadius: 6,
                              backgroundColor: '#ffffff', border: '1px solid #cbd5e1',
                              color: '#334155', fontSize: 12, fontWeight: 600, textDecoration: 'none',
                            }}
                          >
                            Details <ArrowRight size={12} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </TeacherNav>
  );
}
