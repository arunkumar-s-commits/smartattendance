import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITeacher extends Document {
  email: string;
  password: string; // bcrypt hashed
  name: string;
  totalWorkingDays: number | null; // teacher-configured total class days
  createdAt: Date;
}

const TeacherSchema = new Schema<ITeacher>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    name: { type: String, required: true, default: 'Admin Teacher' },
    totalWorkingDays: { type: Number, default: null },
  },
  { timestamps: true }
);

const Teacher: Model<ITeacher> =
  mongoose.models.Teacher || mongoose.model<ITeacher>('Teacher', TeacherSchema);

export default Teacher;
