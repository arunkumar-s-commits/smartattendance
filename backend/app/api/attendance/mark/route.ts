import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Student from '@/models/Student';
import Attendance from '@/models/Attendance';
import QRSession from '@/models/QRSession';
import { getStudentSession } from '@/lib/auth';
import { isWithinRadius } from '@/lib/location';
import { facesMatch } from '@/lib/faceUtils';

export async function POST(request: NextRequest) {
  try {
    const studentSession = await getStudentSession();
    if (!studentSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { qrSessionId, latitude, longitude, faceEmbedding } = body;

    if (!qrSessionId || !latitude || !longitude || !faceEmbedding) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // 1. Validate QR Session (server-side time check)
    const qrSession = await QRSession.findOne({ sessionId: qrSessionId });
    if (!qrSession) {
      return NextResponse.json({ error: 'Invalid QR code' }, { status: 400 });
    }

    const now = new Date();
    if (!qrSession.isActive) {
      return NextResponse.json({ error: 'This QR session has been deactivated' }, { status: 400 });
    }
    if (now < qrSession.activationTime) {
      return NextResponse.json({ error: 'Attendance has not started yet' }, { status: 400 });
    }
    if (now > qrSession.expiryTime) {
      return NextResponse.json({ error: 'This attendance QR has expired' }, { status: 400 });
    }

    // 2. Check for duplicate attendance
    const existingAttendance = await Attendance.findOne({
      studentId: studentSession.id,
      qrSessionId,
    });
    if (existingAttendance) {
      return NextResponse.json(
        { error: 'Attendance already marked for this session' },
        { status: 409 }
      );
    }

    // 3. Validate location (server-side)
    const locationCheck = isWithinRadius(
      parseFloat(latitude),
      parseFloat(longitude),
      qrSession.latitude,
      qrSession.longitude,
      qrSession.allowedRadius
    );

    if (!locationCheck.valid) {
      return NextResponse.json(
        {
          error: `You are outside the allowed attendance area. You are ${locationCheck.distance}m away (allowed: ${qrSession.allowedRadius}m)`,
          distance: locationCheck.distance,
          allowedRadius: qrSession.allowedRadius,
        },
        { status: 400 }
      );
    }

    // 4. Validate face (server-side comparison)
    const student = await Student.findById(studentSession.id);
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    if (!Array.isArray(faceEmbedding) || faceEmbedding.length !== 128) {
      return NextResponse.json({ error: 'Invalid face data' }, { status: 400 });
    }

    const faceVerified = facesMatch(faceEmbedding, student.faceEmbedding);
    if (!faceVerified) {
      return NextResponse.json(
        { error: 'Face verification failed. The detected face does not match your registered profile.' },
        { status: 400 }
      );
    }

    // 5. All checks passed — create attendance record
    const today = now.toISOString().split('T')[0];
    const scanTime = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const attendance = await Attendance.create({
      studentId: studentSession.id,
      studentName: student.name,
      studentEmail: student.email,
      department: student.department,
      date: today,
      qrSessionId,
      scanTime,
      faceVerified: true,
      locationVerified: true,
      status: 'Present',
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    });

    return NextResponse.json({
      success: true,
      message: 'Attendance marked successfully',
      attendance: {
        id: attendance._id.toString(),
        date: attendance.date,
        scanTime: attendance.scanTime,
        status: attendance.status,
      },
    });
  } catch (error: unknown) {
    console.error('Attendance mark error:', error);
    if ((error as { code?: number }).code === 11000) {
      return NextResponse.json(
        { error: 'Attendance already marked for this session' },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
