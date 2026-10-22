'use client';

import { useState, useEffect } from 'react';
import TeacherNav from '@/components/TeacherNav';
import {
  Download, BarChart2, Database, TrendingUp, AlertTriangle,
  CheckCircle, Users, RefreshCw, FileSpreadsheet
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';

interface StudentReport {
  id: string;
  name: string;
  email: string;
  department: string;
  presentDays: number;
  totalDays: number;
  percentage: number;
}

export default function ReportsPage() {
  const [students, setStudents] = useState<StudentReport[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/teacher/students');
      const data = await res.json();
      setStudents(data.students || []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const downloadCSV = () => {
    const headers = ['Name', 'Email', 'Department', 'Present Days', 'Total Days', 'Attendance %'];
    const rows = students.map(s => [s.name, s.email, s.department, s.presentDays, s.totalDays, s.percentage + '%']);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_analytics_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const deptData = Array.from(new Set(students.map(s => s.department))).filter(Boolean).map(dept => {
    const deptStudents = students.filter(s => s.department === dept);
    const avgPct = deptStudents.length > 0
      ? Math.round(deptStudents.reduce((a, s) => a + s.percentage, 0) / deptStudents.length)
      : 0;
    return {
      dept: dept.split(' ').slice(0, 2).join(' '),
      fullName: dept,
      avgPct,
      count: deptStudents.length,
    };
  });

  const rangeData = [
    { range: '0-40%', count: students.filter(s => s.percentage < 40).length, fill: '#dc2626' },
    { range: '40-60%', count: students.filter(s => s.percentage >= 40 && s.percentage < 60).length, fill: '#ef4444' },
    { range: '60-75%', count: students.filter(s => s.percentage >= 60 && s.percentage < 75).length, fill: '#d97706' },
    { range: '75-90%', count: students.filter(s => s.percentage >= 75 && s.percentage < 90).length, fill: '#10b981' },
    { range: '90-100%', count: students.filter(s => s.percentage >= 90).length, fill: '#059669' },
  ];

  const avgAttendance = students.length > 0
    ? Math.round(students.reduce((a, s) => a + s.percentage, 0) / students.length)
    : 0;
  const below60 = students.filter(s => s.percentage < 60).length;
  const above75 = students.filter(s => s.percentage >= 75).length;

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
                    Analytics &amp; Export
                  </span>
                </div>
              </div>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
                Attendance Reports &amp; Intelligence
              </h1>
              <p style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>
                Department breakdown, distribution cohorts, and CSV export
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={downloadCSV}
                id="download-csv-btn"
                disabled={students.length === 0}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '9px 16px', borderRadius: 8,
                  backgroundColor: '#059669', color: '#ffffff',
                  fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
                }}
              >
                <Download size={15} /> Export CSV Report
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div className="spinner" style={{ width: 36, height: 36, margin: '0 auto 16px' }} />
            <div style={{ color: '#64748b', fontSize: 14 }}>Generating attendance analytics...</div>
          </div>
        ) : (
          <>
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
                  Total Evaluated
                </div>
                <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a' }}>
                  {students.length}
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                  All enrolled students
                </div>
              </div>

              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderLeft: `4px solid ${avgAttendance >= 75 ? '#059669' : '#d97706'}`,
                borderRadius: 12,
                padding: 18,
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
                  Cohort Average
                </div>
                <div style={{
                  fontSize: 26, fontWeight: 800,
                  color: avgAttendance >= 75 ? '#059669' : '#d97706',
                }}>
                  {avgAttendance}%
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                  Across all departments
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
                  Debarred Risk (&lt;60%)
                </div>
                <div style={{ fontSize: 26, fontWeight: 800, color: '#dc2626' }}>
                  {below60}
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                  Needs counseling
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
                  Safe Standing (≥75%)
                </div>
                <div style={{ fontSize: 26, fontWeight: 800, color: '#059669' }}>
                  {above75}
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                  Eligible for semester exams
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20, marginBottom: 28 }}>
              {/* Department Comparison Chart */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                padding: 24,
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                  <BarChart2 size={18} color="#059669" />
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                    Average Attendance by Department
                  </h3>
                </div>

                {deptData.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#94a3b8', padding: '50px 0', fontSize: 13 }}>
                    No department data available
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={230}>
                    <BarChart data={deptData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="dept" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" angle={-15} textAnchor="end" />
                      <YAxis tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: 8,
                          fontSize: 12,
                          color: '#0f172a',
                        }}
                        formatter={(v: any) => [`${v}%`, 'Average Rate']}
                      />
                      <Bar dataKey="avgPct" fill="#059669" radius={[6, 6, 0, 0]}>
                        {deptData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.avgPct >= 75 ? '#059669' : entry.avgPct >= 60 ? '#d97706' : '#dc2626'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Attendance Distribution Chart */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                padding: 24,
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                  <TrendingUp size={18} color="#2563eb" />
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                    Student Distribution Across Attendance Bands
                  </h3>
                </div>

                <ResponsiveContainer width="100%" height={230}>
                  <BarChart data={rangeData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: 8,
                        fontSize: 12,
                        color: '#0f172a',
                      }}
                      formatter={(v: any) => [v, 'Students']}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {rangeData.map((entry, index) => (
                        <Cell key={`range-cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Complete Report Table */}
            <div style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}>
              <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                  Complete Student Roster &amp; Percentage Ranks
                </h3>
                <span style={{ fontSize: 12, color: '#64748b' }}>
                  Sorted lowest attendance first
                </span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>#</th>
                      <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Student</th>
                      <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Department</th>
                      <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Present</th>
                      <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Days</th>
                      <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Attendance %</th>
                      <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '50px 20px', color: '#64748b', fontSize: 14 }}>
                          No students found to generate reports.
                        </td>
                      </tr>
                    ) : (
                      students
                        .slice()
                        .sort((a, b) => a.percentage - b.percentage)
                        .map((s, i) => (
                          <tr
                            key={s.id}
                            style={{
                              borderBottom: '1px solid #f1f5f9',
                            }}
                          >
                            <td style={{ padding: '14px 18px', color: '#94a3b8', fontSize: 13, fontFamily: 'monospace' }}>
                              {i + 1}
                            </td>
                            <td style={{ padding: '14px 18px' }}>
                              <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 14 }}>{s.name}</div>
                              <div style={{ fontSize: 12, color: '#64748b' }}>{s.email}</div>
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
                            </td>
                            <td style={{ padding: '14px 18px', fontWeight: 800, fontSize: 14, color: s.percentage >= 75 ? '#059669' : s.percentage >= 60 ? '#d97706' : '#dc2626' }}>
                              {s.percentage}%
                            </td>
                            <td style={{ padding: '14px 18px' }}>
                              {s.percentage >= 75 ? (
                                <span style={{
                                  display: 'inline-flex', alignItems: 'center', gap: 4,
                                  padding: '3px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                                  backgroundColor: '#dcfce7', color: '#15803d',
                                }}>
                                  Eligible
                                </span>
                              ) : s.percentage >= 60 ? (
                                <span style={{
                                  display: 'inline-flex', alignItems: 'center', gap: 4,
                                  padding: '3px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                                  backgroundColor: '#fef3c7', color: '#b45309',
                                }}>
                                  Warning
                                </span>
                              ) : (
                                <span style={{
                                  display: 'inline-flex', alignItems: 'center', gap: 4,
                                  padding: '3px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                                  backgroundColor: '#fee2e2', color: '#b91c1c',
                                }}>
                                  Debarred
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </TeacherNav>
  );
}
