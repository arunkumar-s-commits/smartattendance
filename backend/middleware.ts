import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromRequest } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes — no auth needed
  const publicRoutes = [
    '/',
    '/student/login',
    '/student/register',
    '/teacher/login',
    '/api/auth/student',
    '/api/auth/teacher',
    '/api/auth/logout',
    '/api/seed',
    '/api/student/register',
  ];

  const isPublic = publicRoutes.some((route) => pathname === route || pathname.startsWith(route));
  if (isPublic) return NextResponse.next();

  const session = await getTokenFromRequest(request);

  // Student routes
  if (pathname.startsWith('/student/') || pathname.startsWith('/api/student/')) {
    if (!session || session.type !== 'student') {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/student/login', request.url));
    }
  }

  // Teacher routes
  if (pathname.startsWith('/teacher/') || pathname.startsWith('/api/teacher/')) {
    if (!session || session.type !== 'teacher') {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/teacher/login', request.url));
    }
  }

  // QR and attendance APIs need any authenticated user
  if (pathname.startsWith('/api/qr/') || pathname.startsWith('/api/attendance/')) {
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|models|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)',
  ],
};
