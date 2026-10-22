import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Teacher from '@/models/Teacher';
import { getTeacherSession } from '@/lib/auth';

/** GET /api/teacher/settings — returns current totalWorkingDays */
export async function GET() {
  try {
    const session = await getTeacherSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const teacher = await Teacher.findById(session.id).select('totalWorkingDays').lean();

    return NextResponse.json({
      totalWorkingDays: teacher?.totalWorkingDays ?? null,
    });
  } catch (error) {
    console.error('Teacher settings GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/** PUT /api/teacher/settings — save totalWorkingDays */
export async function PUT(request: NextRequest) {
  try {
    const session = await getTeacherSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { totalWorkingDays } = body;

    // Validate: must be a positive integer or null (to clear)
    if (totalWorkingDays !== null && (typeof totalWorkingDays !== 'number' || !Number.isInteger(totalWorkingDays) || totalWorkingDays <= 0)) {
      return NextResponse.json({ error: 'totalWorkingDays must be a positive integer or null' }, { status: 400 });
    }

    await connectDB();
    await Teacher.findByIdAndUpdate(session.id, { totalWorkingDays: totalWorkingDays ?? null });

    return NextResponse.json({ success: true, totalWorkingDays: totalWorkingDays ?? null });
  } catch (error) {
    console.error('Teacher settings PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
