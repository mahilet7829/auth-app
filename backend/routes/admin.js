import express from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

// Middleware to verify admin token
const verifyAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey123');
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    req.adminId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Get all bookings (with user and destination details)
router.get('/bookings', verifyAdmin, async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: {
          select: {
            id: true,
            fullname: true,
            username: true,
            email: true,
            phoneNumber: true
          }
        },
        destination: true
      },
      orderBy: { bookingDate: 'desc' }
    });
    
    // Calculate statistics
    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
    const pendingBookings = bookings.filter(b => b.status === 'pending').length;
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
    
    res.json({
      success: true,
      data: {
        bookings,
        stats: {
          totalBookings,
          totalRevenue,
          confirmedBookings,
          pendingBookings,
          cancelledBookings
        }
      }
    });
  } catch (error) {
    console.error('Error fetching admin bookings:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all users (for admin)
router.get('/users', verifyAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullname: true,
        username: true,
        email: true,
        phoneNumber: true,
        location: true,
        role: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update booking status
router.put('/bookings/:id/status', verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const booking = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status },
      include: {
        user: { select: { fullname: true, email: true } },
        destination: true
      }
    });
    
    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete booking
router.delete('/bookings/:id', verifyAdmin, async (req, res) => {
  try {
    await prisma.booking.delete({
      where: { id: req.params.id }
    });
    res.json({ success: true, message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;