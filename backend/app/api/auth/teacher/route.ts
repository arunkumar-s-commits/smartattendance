import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import Teacher from '@/models/Teacher';
import { signToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const teacher = await Teacher.findOne({ email: email.toLowerCase().trim() });
    if (!teacher) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, teacher.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const token = await signToken({
      type: 'teacher',
      id: teacher._id.toString(),
      email: teacher.email,
      name: teacher.name,
    });

    const response = NextResponse.json({
      success: true,
      teacher: {
        id: teacher._id.toString(),
        name: teacher.name,
        email: teacher.email,
      },
    });

    return setAuthCookie(response, token);
  } catch (error) {
    console.error('Teacher login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
