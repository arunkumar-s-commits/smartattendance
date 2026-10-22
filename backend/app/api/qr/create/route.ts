import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import connectDB from '@/lib/mongodb';
import QRSession from '@/models/QRSession';
import { getTeacherSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getTeacherSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { activationTime, expiryTime, latitude, longitude, allowedRadius } = body;

    if (!activationTime || !expiryTime || !latitude || !longitude) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const activation = new Date(activationTime);
    const expiry = new Date(expiryTime);

    if (expiry <= activation) {
      return NextResponse.json({ error: 'Expiry time must be after activation time' }, { status: 400 });
    }

    const sessionId = uuidv4();

    const qrSession = await QRSession.create({
      sessionId,
      teacherId: session.id,
      activationTime: activation,
      expiryTime: expiry,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      allowedRadius: parseInt(allowedRadius) || 50,
      isActive: true,
    });

    return NextResponse.json({
      success: true,
      sessionId: qrSession.sessionId,
      activationTime: qrSession.activationTime,
      expiryTime: qrSession.expiryTime,
      latitude: qrSession.latitude,
      longitude: qrSession.longitude,
      allowedRadius: qrSession.allowedRadius,
    });
  } catch (error) {
    console.error('QR create error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getTeacherSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const now = new Date();
    const activeSession = await QRSession.findOne({
      teacherId: session.id,
      isActive: true,
      expiryTime: { $gt: now },
    }).sort({ createdAt: -1 });

    return NextResponse.json({ activeSession });
  } catch (error) {
    console.error('QR get error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
