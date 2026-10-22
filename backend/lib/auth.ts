import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-change-in-production'
);

export interface StudentPayload {
  type: 'student';
  id: string;
  email: string;
  name: string;
  department: string;
}

export interface TeacherPayload {
  type: 'teacher';
  id: string;
  email: string;
  name: string;
}

export type JWTPayload = StudentPayload | TeacherPayload;

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function getSessionFromCookie(): Promise<JWTPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get('attendance_token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function getStudentSession(): Promise<StudentPayload | null> {
  const session = await getSessionFromCookie();
  if (!session || session.type !== 'student') return null;
  return session as StudentPayload;
}

export async function getTeacherSession(): Promise<TeacherPayload | null> {
  const session = await getSessionFromCookie();
  if (!session || session.type !== 'teacher') return null;
  return session as TeacherPayload;
}

export function setAuthCookie(response: NextResponse, token: string): NextResponse {
  response.cookies.set('attendance_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
  return response;
}

export function clearAuthCookie(response: NextResponse): NextResponse {
  response.cookies.set('attendance_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  return response;
}

export async function getTokenFromRequest(req: NextRequest): Promise<JWTPayload | null> {
  const token = req.cookies.get('attendance_token')?.value;
  if (!token) return null;
  return verifyToken(token);
}
