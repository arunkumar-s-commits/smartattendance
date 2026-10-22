import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStudent extends Document {
  name: string;
  email: string;
  mobile: string; // hashed
  department: string;
  photo: string; // base64 or URL
  faceEmbedding: number[]; // 128-dim face descriptor
  createdAt: Date;
}

const StudentSchema = new Schema<IStudent>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    mobile: { type: String, required: true }, // bcrypt hashed
    department: { type: String, required: true },
    photo: { type: String, required: true }, // base64 data URL
    faceEmbedding: { type: [Number], required: true }, // 128-float array
  },
  { timestamps: true }
);

const Student: Model<IStudent> =
  mongoose.models.Student || mongoose.model<IStudent>('Student', StudentSchema);

export default Student;
