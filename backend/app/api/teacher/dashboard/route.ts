import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Student from '@/models/Student';
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

    const [totalStudents, presentToday, allStudents] = await Promise.all([
      Student.countDocuments(),
      Attendance.countDocuments({ date: today, status: 'Present' }),
      Student.find().select('name email department photo').lean(),
    ]);

    const absentToday = totalStudents - presentToday;
    const attendanceRate = totalStudents > 0
      ? Math.round((presentToday / totalStudents) * 100)
      : 0;

    // Last 7 days attendance data for chart
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const recentAttendance = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: sevenDaysAgo.toISOString().split('T')[0] },
          status: 'Present',
        },
      },
      {
        $group: {
          _id: '$date',
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return NextResponse.json({
      totalStudents,
      presentToday,
      absentToday,
      attendanceRate,
      recentAttendance,
    });
  } catch (error) {
    console.error('Teacher dashboard error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
