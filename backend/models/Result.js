import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
  subjectCode: { type: String, required: true },
  subjectName: { type: String, required: true },
  internalMarks: { type: String, default: '-' },
  externalMarks: { type: String, default: '-' },
  totalMarks: { type: String, required: true },
  result: { type: String, required: true } // 'P' (Pass) or 'F' (Fail)
});

const resultSchema = new mongoose.Schema({
  title: { type: String, required: true }, // e.g. "B.Tech III Year I Sem Regular Results Nov 2025"
  rollNumber: { type: String, required: true, index: true },
  studentName: { type: String, required: true },
  subjects: [subjectSchema]
}, { timestamps: true });

// Ensures updating works seamlessly for the same student and title
resultSchema.index({ rollNumber: 1, title: 1 }, { unique: true });

export default mongoose.model('Result', resultSchema);
