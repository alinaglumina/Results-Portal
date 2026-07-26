import express from 'express';
import Result from '../models/Result.js';
import { verifyAdmin } from '../middleware/auth.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// POST /api/results/admin/login - Admin Login
router.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  
  // Replace with DB lookup in production
  if (username === 'admin' && password === 'admin123') {
    const token = jwt.sign({ role: 'ADMIN' }, process.env.JWT_SECRET || 'default_secret', { expiresIn: '1d' });
    return res.json({ token });
  }
  
  res.status(401).json({ message: 'Invalid credentials' });
});

// GET /api/results - Get all results (Admin View)
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const results = await Result.find().sort({ createdAt: -1 });
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch results' });
  }
});

// POST /api/results - Create new result (Protected)
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const newResult = new Result(req.body);
    const saved = await newResult.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: 'Error adding result', error: error.message });
  }
});

// DELETE /api/results/:id - Delete a result (Protected)
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    await Result.findByIdAndDelete(req.params.id);
    res.json({ message: 'Result deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting result' });
  }
});

export default router;