import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IQRSession extends Document {
  sessionId: string;
  teacherId: string;
  activationTime: Date;
  expiryTime: Date;
  latitude: number;
  longitude: number;
  allowedRadius: number; // meters
  isActive: boolean;
  createdAt: Date;
}

const QRSessionSchema = new Schema<IQRSession>(
  {
    sessionId: { type: String, required: true, unique: true },
    teacherId: { type: String, required: true },
    activationTime: { type: Date, required: true },
    expiryTime: { type: Date, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    allowedRadius: { type: Number, required: true, default: 50 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

QRSessionSchema.index({ sessionId: 1 });
QRSessionSchema.index({ isActive: 1, expiryTime: 1 });

const QRSession: Model<IQRSession> =
  mongoose.models.QRSession || mongoose.model<IQRSession>('QRSession', QRSessionSchema);

export default QRSession;
