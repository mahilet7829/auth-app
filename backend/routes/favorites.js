import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey123');
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Get user favorites
router.get('/', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('favorites');
    res.json({ success: true, data: user.favorites });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add to favorites
router.post('/:destinationId', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const destinationId = req.params.destinationId;
    
    if (!user.favorites.includes(destinationId)) {
      user.favorites.push(destinationId);
      await user.save();
    }
    
    await user.populate('favorites');
    res.json({ success: true, data: user.favorites });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove from favorites
router.delete('/:destinationId', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    user.favorites = user.favorites.filter(id => id.toString() !== req.params.destinationId);
    await user.save();
    await user.populate('favorites');
    res.json({ success: true, data: user.favorites });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;