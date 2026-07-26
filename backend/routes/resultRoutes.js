import express from 'express';
import Result from '../models/Result.js';
import { verifyAdmin } from '../middleware/auth.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Admin Login
router.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin123') {
    const token = jwt.sign({ role: 'ADMIN' }, process.env.JWT_SECRET || 'default_secret', { expiresIn: '1d' });
    return res.json({ token });
  }
  res.status(401).json({ message: 'Invalid credentials' });
});

// GET /api/results/titles - Get distinct published examination titles
router.get('/titles', async (req, res) => {
  try {
    const titles = await Result.distinct('title');
    res.json(titles);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching exam titles' });
  }
});

// GET /api/results/summary - Grouped by Exam Title with Student Count (Admin Panel)
router.get('/summary', verifyAdmin, async (req, res) => {
  try {
    const summary = await Result.aggregate([
      {
        $group: {
          _id: "$title",
          count: { $sum: 1 }
        }
      }
    ]);
    const formatted = summary.map((s) => ({ title: s._id, count: s.count }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch summary' });
  }
});

// GET /api/results/:rollNumber - Fetch student results
router.get('/:rollNumber', async (req, res) => {
  try {
    const results = await Result.find({ rollNumber: req.params.rollNumber.toUpperCase() });
    if (!results || results.length === 0) {
      return res.status(404).json({ message: 'No result found for this Roll Number.' });
    }
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// POST /api/results/bulk - Bulk Upload / Update with Title (Upsert)
router.post('/bulk', verifyAdmin, async (req, res) => {
  try {
    const { title, studentResults } = req.body;

    if (!title || !studentResults || !Array.isArray(studentResults)) {
      return res.status(400).json({ message: 'Exam Title and Student Results are required.' });
    }

    const operations = studentResults.map((student) => ({
      updateOne: {
        filter: { rollNumber: student.rollNumber.toUpperCase(), title: title },
        update: {
          $set: {
            title: title,
            rollNumber: student.rollNumber.toUpperCase(),
            studentName: student.studentName,
            subjects: student.subjects
          }
        },
        upsert: true
      }
    }));

    await Result.bulkWrite(operations);
    res.status(200).json({ message: `Successfully published/updated results for ${studentResults.length} students!` });
  } catch (error) {
    res.status(500).json({ message: 'Error publishing results', error: error.message });
  }
});

// DELETE /api/results/title/:title - Delete entire examination result set
router.delete('/title/:title', verifyAdmin, async (req, res) => {
  try {
    await Result.deleteMany({ title: req.params.title });
    res.json({ message: 'Examination results deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting examination results' });
  }
});

export default router;
