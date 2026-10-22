import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Attendance from '@/models/Attendance';
import Teacher from '@/models/Teacher';
import { getStudentSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getStudentSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const records = await Attendance.find({ studentId: session.id })
      .sort({ date: -1, createdAt: -1 })
      .lean();

    const today = new Date().toISOString().split('T')[0];
    const todayRecord = records.find((r) => r.date === today);

    const totalPresent = records.filter((r) => r.status === 'Present').length;

    // Read teacher-configured total working days from DB (applies to all students)
    const teacherDoc = await Teacher.findOne().select('totalWorkingDays').lean();
    const teacherTotalDays = teacherDoc?.totalWorkingDays ?? null;

    // Use teacher-set days if available, otherwise fall back to actual record count
    const totalDays = (teacherTotalDays && teacherTotalDays > 0)
      ? teacherTotalDays
      : records.length;

    const percentage = totalDays > 0 ? Math.round((totalPresent / totalDays) * 100) : 0;

    return NextResponse.json({
      records: records.map((r) => ({
        id: r._id.toString(),
        date: r.date,
        scanTime: r.scanTime,
        status: r.status,
        faceVerified: r.faceVerified,
        locationVerified: r.locationVerified,
      })),
      stats: {
        totalDays,
        totalPresent,
        totalAbsent: totalDays - totalPresent,
        percentage,
        todayStatus: todayRecord ? todayRecord.status : 'Not Marked',
        teacherSetDays: teacherTotalDays, // so UI can show a note
      },
    });
  } catch (error) {
    console.error('Student attendance error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
