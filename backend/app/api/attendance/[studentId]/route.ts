import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Attendance from '@/models/Attendance';
import { getTeacherSession } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
  try {
    const session = await getTeacherSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const records = await Attendance.find({ studentId: params.studentId })
      .sort({ date: -1 })
      .lean();

    return NextResponse.json({
      records: records.map((r) => ({
        id: r._id.toString(),
        date: r.date,
        scanTime: r.scanTime,
        status: r.status,
        faceVerified: r.faceVerified,
        locationVerified: r.locationVerified,
      })),
    });
  } catch (error) {
    console.error('Attendance history error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
