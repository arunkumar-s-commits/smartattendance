import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAttendance extends Document {
  studentId: mongoose.Types.ObjectId;
  studentName: string;
  studentEmail: string;
  department: string;
  date: string; // YYYY-MM-DD
  qrSessionId: string;
  scanTime: string; // HH:MM AM/PM
  faceVerified: boolean;
  locationVerified: boolean;
  status: 'Present' | 'Absent';
  latitude: number;
  longitude: number;
  createdAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    studentName: { type: String, required: true },
    studentEmail: { type: String, required: true },
    department: { type: String, required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    qrSessionId: { type: String, required: true },
    scanTime: { type: String, required: true },
    faceVerified: { type: Boolean, default: false },
    locationVerified: { type: Boolean, default: false },
    status: { type: String, enum: ['Present', 'Absent'], default: 'Present' },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  { timestamps: true }
);

// Prevent duplicate attendance for same student in same QR session
AttendanceSchema.index({ studentId: 1, qrSessionId: 1 }, { unique: true });
AttendanceSchema.index({ date: 1 });
AttendanceSchema.index({ studentId: 1, date: 1 });

const Attendance: Model<IAttendance> =
  mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', AttendanceSchema);

export default Attendance;
