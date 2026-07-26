import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
  subjectName: { type: String, required: true },
  marksObtained: { type: Number, required: true },
  maxMarks: { type: Number, required: true, default: 100 }
});

const resultSchema = new mongoose.Schema({
  rollNumber: { type: String, required: true, unique: true, index: true },
  studentName: { type: String, required: true },
  course: { type: String, required: true },
  semester: { type: String, required: true },
  academicYear: { type: String, required: true },
  subjects: [subjectSchema],
  cgpa: { type: Number, required: true },
  status: { type: String, enum: ['PASS', 'FAIL'], default: 'PASS' }
}, { timestamps: true });

export default mongoose.model('Result', resultSchema);