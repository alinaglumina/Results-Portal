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

// GET /api/results - Admin List All Results
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const results = await Result.find().sort({ createdAt: -1 });
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch results' });
  }
});

// POST /api/results/bulk - Bulk Upload / Update with Title (Upsert)
router.post('/bulk', verifyAdmin, async (req, res) => {
  try {
    const { title, studentResults } = req.body;

    if (!title || !studentResults || !Array.isArray(studentResults)) {
      return res.status(400).json({ message: 'Exam Title and Student Results are required.' });
    }

    // Bulk write operation (Upsert: update if exists, insert if new)
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

// DELETE /api/results/:id - Delete result
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    await Result.findByIdAndDelete(req.params.id);
    res.json({ message: 'Result deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting result' });
  }
});

export default router;
