import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://sakthivel_username:sakthivel%40123@cluster0.0zfbxgl.mongodb.net/attendance_tracker?retryWrites=true&w=majority&appName=Cluster0';

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI, { dbName: 'attendance_tracker' });

  const teacherSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    department: String,
    totalWorkingDays: Number,
  });

  const Teacher = mongoose.models.Teacher || mongoose.model('Teacher', teacherSchema);

  const existing = await Teacher.findOne({ email: 'admin@teacher.com' });
  if (existing) {
    console.log('Teacher account admin@teacher.com already exists.');
  } else {
    const hashedPassword = await bcrypt.hash('admin2026', 10);
    await Teacher.create({
      name: 'Dr. Faculty Admin',
      email: 'admin@teacher.com',
      password: hashedPassword,
      department: 'Computer Science Engineering',
    });
    console.log('Created default teacher account: admin@teacher.com / admin2026');
  }

  await mongoose.disconnect();
  console.log('Seed completed successfully.');
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
