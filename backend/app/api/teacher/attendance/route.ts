import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Attendance from '@/models/Attendance';
import { getTeacherSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getTeacherSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const today = new Date().toISOString().split('T')[0];

    const records = await Attendance.find({ date: today })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      date: today,
      records: records.map((r) => ({
        id: r._id.toString(),
        studentId: r.studentId.toString(),
        studentName: r.studentName,
        studentEmail: r.studentEmail,
        department: r.department,
        scanTime: r.scanTime,
        faceVerified: r.faceVerified,
        locationVerified: r.locationVerified,
        status: r.status,
      })),
    });
  } catch (error) {
    console.error('Teacher attendance error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
