import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import adminRoutes from './routes/admin.js';

dotenv.config();

const prisma = new PrismaClient();
const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// ==================== AUTH ROUTES ====================
// Welcome route
app.get("/api", (req, res) => {
  res.json({
    message: "Ethiopia Travel Guide API",
    version: "1.0.0",
    endpoints: {
      auth: {
        register: "POST /api/auth/register",
        login: "POST /api/auth/login",
        me: "GET /api/auth/me"
      },
      destinations: {
        all: "GET /api/destinations",
        single: "GET /api/destinations/:id",
        seed: "GET /api/destinations/seed"
      },
      bookings: {
        create: "POST /api/bookings",
        myBookings: "GET /api/bookings/my-bookings",
        cancel: "PUT /api/bookings/:id/cancel"
      },
      favorites: {
        all: "GET /api/favorites",
        add: "POST /api/favorites/:destinationId",
        remove: "DELETE /api/favorites/:destinationId"
      },
      admin: {
        bookings: "GET /api/admin/bookings",
        users: "GET /api/admin/users",
        updateStatus: "PUT /api/admin/bookings/:id/status"
      }
    }
  });
});
// Register
app.post("/api/auth/register", async (req, res) => {
  try {
    const { fullname, username, email, location, password, birthdate } = req.body;
    
    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }]
      }
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        fullname,
        username,
        email,
        password: hashedPassword,
        location: location || '',
        birthdate: birthdate ? new Date(birthdate) : new Date('2000-01-01'),
        role: 'user' // Default role
      }
    });
    
    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'secretkey123',
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        fullname: user.fullname,
        username: user.username,
        email: user.email,
        location: user.location,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { userId: user.id, email: user.email, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'secretkey123',
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        fullname: user.fullname,
        username: user.username,
        email: user.email,
        location: user.location,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get current user
app.get("/api/auth/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey123');
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { 
        id: true, 
        fullname: true, 
        username: true, 
        email: true, 
        location: true,
        role: true
      }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// ==================== DESTINATION ROUTES ====================

// Get all destinations
app.get("/api/destinations", async (req, res) => {
  try {
    const destinations = await prisma.destination.findMany();
    res.json({ success: true, data: destinations });
  } catch (error) {
    console.error('Error fetching destinations:', error);
    res.json({ success: true, data: [] });
  }
});

// Get single destination
app.get("/api/destinations/:id", async (req, res) => {
  try {
    const destination = await prisma.destination.findUnique({
      where: { id: req.params.id }
    });
    if (!destination) {
      return res.status(404).json({ message: 'Destination not found' });
    }
    res.json({ success: true, data: destination });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== BOOKING ROUTES ====================

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
app.post("/api/bookings", verifyToken, async (req, res) => {
  try {
    const { destinationId, checkInDate, checkOutDate, numberOfTravelers, specialRequests } = req.body;
    
    const destination = await prisma.destination.findUnique({
      where: { id: destinationId }
    });
    
    if (!destination) {
      return res.status(404).json({ message: 'Destination not found' });
    }
    
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    
    // Extract numeric price from string
    const priceMatch = destination.price.match(/(\d+)/);
    const pricePerNight = priceMatch ? parseInt(priceMatch[1]) : 2000;
    const totalPrice = pricePerNight * numberOfTravelers * nights;
    
    const booking = await prisma.booking.create({
      data: {
        userId: req.userId,
        destinationId,
        checkInDate,
        checkOutDate,
        numberOfTravelers,
        totalPrice,
        specialRequests
      },
      include: {
        destination: true,
        user: {
          select: { fullname: true, email: true }
        }
      }
    });
    
    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get user bookings
app.get("/api/bookings/my-bookings", verifyToken, async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.userId },
      include: { destination: true },
      orderBy: { bookingDate: 'desc' }
    });
    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Cancel booking
app.put("/api/bookings/:id/cancel", verifyToken, async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id }
    });
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    if (booking.userId !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const updatedBooking = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status: 'cancelled' }
    });
    
    res.json({ success: true, data: updatedBooking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== FAVORITE ROUTES ====================

// Get user favorites
app.get("/api/favorites", verifyToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { favorites: true }
    });
    res.json({ success: true, data: user?.favorites || [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add to favorites
app.post("/api/favorites/:destinationId", verifyToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { favorites: true }
    });
    
    const destinationId = req.params.destinationId;
    const isFavorite = user.favorites.some(fav => fav.id === destinationId);
    
    if (!isFavorite) {
      await prisma.user.update({
        where: { id: req.userId },
        data: {
          favorites: {
            connect: { id: destinationId }
          }
        }
      });
    }
    
    const updatedUser = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { favorites: true }
    });
    
    res.json({ success: true, data: updatedUser.favorites });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove from favorites
app.delete("/api/favorites/:destinationId", verifyToken, async (req, res) => {
  try {
    await prisma.user.update({
      where: { id: req.userId },
      data: {
        favorites: {
          disconnect: { id: req.params.destinationId }
        }
      }
    });
    
    const updatedUser = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { favorites: true }
    });
    
    res.json({ success: true, data: updatedUser.favorites });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== ADMIN ROUTES ====================

// Admin middleware
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

// Get all bookings (admin only)
app.get("/api/admin/bookings", verifyAdmin, async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: {
          select: { id: true, fullname: true, username: true, email: true, phoneNumber: true }
        },
        destination: true
      },
      orderBy: { bookingDate: 'desc' }
    });
    
    const stats = {
      totalBookings: bookings.length,
      totalRevenue: bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0),
      confirmedBookings: bookings.filter(b => b.status === 'confirmed').length,
      pendingBookings: bookings.filter(b => b.status === 'pending').length,
      cancelledBookings: bookings.filter(b => b.status === 'cancelled').length
    };
    
    res.json({ success: true, data: { bookings, stats } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all users (admin only)
app.get("/api/admin/users", verifyAdmin, async (req, res) => {
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

// Update booking status (admin only)
app.put("/api/admin/bookings/:id/status", verifyAdmin, async (req, res) => {
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

// Delete booking (admin only)
app.delete("/api/admin/bookings/:id", verifyAdmin, async (req, res) => {
  try {
    await prisma.booking.delete({
      where: { id: req.params.id }
    });
    res.json({ success: true, message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== SEED DESTINATIONS ====================

app.get("/api/destinations/seed", async (req, res) => {
  try {
    const count = await prisma.destination.count();
    if (count === 0) {
      const destinations = [
        {
          name: "Lalibela",
          location: "Lalibela",
          region: "Amhara",
          category: "historical",
          images: ["https://i.pinimg.com/736x/e6/c6/6d/e6c66dd3d26469e205da54776ef0259c.jpg"],
          description: "Famous for its 11 rock-hewn churches, often called the 'Eighth Wonder of the World'.",
          bestTime: "October to March",
          duration: "2-3 days",
          price: "5,000 - 8,000 ETB",
          priceLevel: "$$$",
          rating: 4.9,
          activities: ["Church Tour", "Hiking", "Coffee Ceremony"]
        },
        {
          name: "Simien Mountains",
          location: "Simien Mountains",
          region: "Amhara",
          category: "nature",
          images: ["https://i.pinimg.com/736x/65/97/de/6597debe2e191b470276cbe0171a9410.jpg"],
          description: "UNESCO World Heritage site with stunning landscapes.",
          bestTime: "September to November",
          duration: "4-5 days",
          price: "3,500 - 6,000 ETB",
          priceLevel: "$$",
          rating: 4.8,
          activities: ["Trekking", "Wildlife Viewing", "Camping"]
        }
      ];
      
      await prisma.destination.createMany({ data: destinations });
      res.json({ message: `✅ Seeded ${destinations.length} destinations` });
    } else {
      res.json({ message: `Database already has ${count} destinations` });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📍 API available at http://localhost:${PORT}/api`);
});