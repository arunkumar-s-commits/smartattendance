import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Student from '@/models/Student';
import Attendance from '@/models/Attendance';
import { getTeacherSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getTeacherSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Optional teacher-specified total working days
    const url = new URL(request.url);
    const teacherTotalDaysParam = url.searchParams.get('totalDays');
    const teacherTotalDays = teacherTotalDaysParam ? parseInt(teacherTotalDaysParam, 10) : null;

    const students = await Student.find()
      .select('-mobile -faceEmbedding')
      .sort({ name: 1 })
      .lean();

    // Get attendance counts per student
    const attendanceCounts = await Attendance.aggregate([
      { $match: { status: 'Present' } },
      { $group: { _id: '$studentId', count: { $sum: 1 } } },
    ]);

    const countMap = new Map(
      attendanceCounts.map((a) => [a._id.toString(), a.count])
    );

    // Use teacher-entered total days if valid, otherwise fall back to distinct dates in DB
    let effectiveTotalDays: number;
    if (teacherTotalDays && teacherTotalDays > 0) {
      effectiveTotalDays = teacherTotalDays;
    } else {
      const distinctDates = await Attendance.distinct('date');
      effectiveTotalDays = distinctDates.length;
    }

    return NextResponse.json({
      totalDays: effectiveTotalDays,
      students: students.map((s) => {
        const presentDays = countMap.get(s._id.toString()) || 0;
        return {
          id: s._id.toString(),
          name: s.name,
          email: s.email,
          department: s.department,
          photo: s.photo,
          presentDays,
          totalDays: effectiveTotalDays,
          percentage:
            effectiveTotalDays > 0
              ? Math.round((presentDays / effectiveTotalDays) * 100)
              : 0,
        };
      }),
    });
  } catch (error) {
    console.error('Teacher students error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
