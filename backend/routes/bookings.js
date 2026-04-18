import express from 'express';
import jwt from 'jsonwebtoken';
import Booking from '../models/Booking.js';
import Destination from '../models/Destination.js';

const router = express.Router();

// Middleware to verify token
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

// Create booking
router.post('/', verifyToken, async (req, res) => {
  try {
    const { destinationId, checkInDate, checkOutDate, numberOfTravelers, specialRequests } = req.body;
    
    const destination = await Destination.findById(destinationId);
    if (!destination) {
      return res.status(404).json({ message: 'Destination not found' });
    }
    
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    
    // Extract numeric price from string like "5,000 - 8,000 ETB"
    const priceMatch = destination.price.match(/(\d+)/);
    const pricePerNight = priceMatch ? parseInt(priceMatch[1]) : 2000;
    const totalPrice = pricePerNight * numberOfTravelers * nights;
    
    const booking = new Booking({
      user: req.userId,
      destination: destinationId,
      checkInDate,
      checkOutDate,
      numberOfTravelers,
      totalPrice,
      specialRequests
    });
    
    await booking.save();
    
    const populatedBooking = await Booking.findById(booking._id)
      .populate('destination')
      .populate('user', 'fullname email');
    
    res.status(201).json({ success: true, data: populatedBooking });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get user bookings
router.get('/my-bookings', verifyToken, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.userId })
      .populate('destination')
      .sort('-bookingDate');
    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Cancel booking
router.put('/:id/cancel', verifyToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    if (booking.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    booking.status = 'cancelled';
    await booking.save();
    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;