import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Student from '@/models/Student';
import Attendance from '@/models/Attendance';
import { getTeacherSession } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getTeacherSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const student = await Student.findById(params.id)
      .select('-mobile -faceEmbedding')
      .lean();

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const records = await Attendance.find({ studentId: params.id })
      .sort({ date: -1 })
      .lean();

    const totalPresent = records.filter((r) => r.status === 'Present').length;

    // Use teacher-specified total days if provided; otherwise fall back to actual session count
    const url = new URL(request.url);
    const teacherTotalDaysParam = url.searchParams.get('totalDays');
    const teacherTotalDays = teacherTotalDaysParam ? parseInt(teacherTotalDaysParam, 10) : null;

    const totalDays = (teacherTotalDays && teacherTotalDays > 0)
      ? teacherTotalDays
      : records.length;

    const percentage = totalDays > 0 ? Math.round((totalPresent / totalDays) * 100) : 0;

    return NextResponse.json({
      student: {
        id: student._id.toString(),
        name: student.name,
        email: student.email,
        department: student.department,
        photo: student.photo,
        createdAt: student.createdAt,
      },
      attendance: {
        totalDays,
        totalPresent,
        totalAbsent: totalDays - totalPresent,
        percentage,
        records: records.map((r) => ({
          id: r._id.toString(),
          date: r.date,
          scanTime: r.scanTime,
          status: r.status,
          faceVerified: r.faceVerified,
          locationVerified: r.locationVerified,
        })),
      },
    });
  } catch (error) {
    console.error('Student detail error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
