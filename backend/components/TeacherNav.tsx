'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, QrCode, ClipboardList, Users, LogOut, Menu, X, BarChart2, Database, Activity, ExternalLink } from 'lucide-react';

interface TeacherNavProps { children: React.ReactNode; }

export default function TeacherNav({ children }: TeacherNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const navItems = [
    { href: '/teacher/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { href: '/teacher/qr-generator', label: 'Generate QR', icon: <QrCode size={18} /> },
    { href: '/teacher/attendance', label: 'Live Attendance', icon: <Activity size={18} /> },
    { href: '/teacher/students', label: 'Students', icon: <Users size={18} /> },
    { href: '/teacher/reports', label: 'Reports', icon: <BarChart2 size={18} /> },
  ];

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#ffffff' }}>
      {/* Logo */}
      <div style={{ padding: '20px 18px', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38,
            backgroundColor: '#059669',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#ffffff',
          }}>
            <Database size={18} />
          </div>
          <div>
            <div style={{ color: '#0f172a', fontWeight: 700, fontSize: 15 }}>Smart Attendance</div>
            <div style={{ color: '#64748b', fontSize: 11 }}>Faculty Control Panel</div>
          </div>
        </div>
        {/* Status badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12,
          backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0',
          borderRadius: 6, padding: '3px 8px',
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10b981' }} />
          <span style={{ fontSize: 11, color: '#047857', fontWeight: 600 }}>FACULTY ACTIVE</span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, letterSpacing: '0.05em', padding: '6px 10px', textTransform: 'uppercase' }}>
          Management
        </div>
        {navItems.map(item => {
          const isActive = pathname === item.href || (item.href !== '/teacher/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 8,
                color: isActive ? '#047857' : '#334155',
                backgroundColor: isActive ? '#ecfdf5' : 'transparent',
                fontWeight: isActive ? 600 : 500,
                fontSize: 14,
                textDecoration: 'none',
                transition: 'background 0.15s',
              }}
            >
              <span style={{ color: isActive ? '#059669' : '#64748b' }}>{item.icon}</span>
              <span>{item.label}</span>
              {isActive && (
                <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', backgroundColor: '#059669' }} />
              )}
            </Link>
          );
        })}

        <div style={{ marginTop: 'auto', paddingTop: 16 }}>
          <a
            href={frontendUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '9px 12px',
              borderRadius: 8,
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              color: '#1d4ed8',
              fontSize: 12,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            <span>Student Portal (Frontend)</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </nav>

      {/* Logout */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid #e2e8f0' }}>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 12px',
            borderRadius: 8,
            color: '#dc2626',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600,
            width: '100%',
            textAlign: 'left',
          }}
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a' }}>
      {/* Desktop sidebar */}
      <aside style={{ width: 250, minHeight: '100vh', borderRight: '1px solid #e2e8f0', backgroundColor: '#ffffff', flexShrink: 0 }}>
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <>
          <div
            onClick={() => setSidebarOpen(false)}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', zIndex: 99 }}
          />
          <div style={{
            position: 'fixed', top: 0, left: 0, zIndex: 100,
            width: 270, height: '100vh',
            backgroundColor: '#ffffff',
            display: 'flex', flexDirection: 'column',
            borderRight: '1px solid #e2e8f0',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
              <span style={{ color: '#0f172a', fontWeight: 700 }}>Faculty Menu</span>
              <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ flex: 1, overflow: 'auto' }}>
              <SidebarContent />
            </div>
          </div>
        </>
      )}

      {/* Main content area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Mobile top bar */}
        <div style={{
          display: 'none',
          padding: '12px 16px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, backgroundColor: '#059669', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <Database size={16} />
            </div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>Teacher Portal</div>
          </div>
          <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', color: '#334155', cursor: 'pointer' }}>
            <Menu size={22} />
          </button>
        </div>

        <main style={{ flex: 1, padding: '32px 36px', overflowX: 'hidden' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
