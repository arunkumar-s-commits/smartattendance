import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import Teacher from '@/models/Teacher';

export async function POST() {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 });
    }

    await connectDB();

    // Create teacher account
    const existing = await Teacher.findOne({ email: 'admin@teacher.com' });
    if (!existing) {
      const hashedPassword = await bcrypt.hash('admin2026', 12);
      await Teacher.create({
        email: 'admin@teacher.com',
        password: hashedPassword,
        name: 'Admin Teacher',
      });
      console.log('✅ Teacher account created');
    } else {
      console.log('ℹ️ Teacher already exists');
    }

    return NextResponse.json({
      success: true,
      message: 'Seed completed',
      teacher: { email: 'admin@teacher.com', password: 'admin2026' },
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Seed failed' }, { status: 500 });
  }
}
