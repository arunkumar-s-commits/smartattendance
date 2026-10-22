import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import Student from '@/models/Student';
import { signToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const student = await Student.findOne({ email: email.toLowerCase().trim() });
    if (!student) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, student.mobile);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const token = await signToken({
      type: 'student',
      id: student._id.toString(),
      email: student.email,
      name: student.name,
      department: student.department,
    });

    const response = NextResponse.json({
      success: true,
      student: {
        id: student._id.toString(),
        name: student.name,
        email: student.email,
        department: student.department,
      },
    });

    return setAuthCookie(response, token);
  } catch (error) {
    console.error('Student login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
