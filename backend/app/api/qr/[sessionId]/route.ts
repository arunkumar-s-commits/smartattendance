import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import QRSession from '@/models/QRSession';

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    await connectDB();

    const session = await QRSession.findOne({ sessionId: params.sessionId });

    if (!session) {
      return NextResponse.json({ valid: false, reason: 'invalid', error: 'Invalid QR code' }, { status: 404 });
    }

    const now = new Date();

    if (!session.isActive) {
      return NextResponse.json({ valid: false, reason: 'inactive', error: 'This QR session has been deactivated' });
    }

    if (now < session.activationTime) {
      return NextResponse.json({
        valid: false,
        reason: 'not_started',
        error: 'Attendance has not started yet',
        activationTime: session.activationTime,
      });
    }

    if (now > session.expiryTime) {
      return NextResponse.json({
        valid: false,
        reason: 'expired',
        error: 'This attendance QR has expired',
        expiryTime: session.expiryTime,
      });
    }

    return NextResponse.json({
      valid: true,
      sessionId: session.sessionId,
      activationTime: session.activationTime,
      expiryTime: session.expiryTime,
      latitude: session.latitude,
      longitude: session.longitude,
      allowedRadius: session.allowedRadius,
    });
  } catch (error) {
    console.error('QR validate error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
