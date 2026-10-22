import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import Student from '@/models/Student';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { name, email, mobile, department, photo, faceEmbedding } = body;

    // Validate required fields
    if (!name || !email || !mobile || !department || !photo || !faceEmbedding) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Validate face embedding
    if (!Array.isArray(faceEmbedding) || faceEmbedding.length !== 128) {
      return NextResponse.json(
        { error: 'Invalid face embedding. Please upload a clear photo with your face visible.' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existing = await Student.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Validate mobile number (10 digits)
    const cleanMobile = mobile.replace(/\s/g, '');
    if (!/^\d{10}$/.test(cleanMobile)) {
      return NextResponse.json(
        { error: 'Mobile number must be 10 digits' },
        { status: 400 }
      );
    }

    // Hash the mobile number (used as password)
    const hashedMobile = await bcrypt.hash(cleanMobile, 12);

    const student = await Student.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      mobile: hashedMobile,
      department,
      photo, // base64 data URL
      faceEmbedding, // 128-dim array
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully',
        studentId: student._id.toString(),
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Student registration error:', error);
    if ((error as { code?: number }).code === 11000) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
