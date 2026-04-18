import express from 'express';
import Destination from '../models/Destination.js';

const router = express.Router();

// SEED ROUTE - Use GET for easy testing
router.get('/seed', async (req, res) => {
  try {
    console.log('🌱 Starting database seed...');
    
    // Clear existing destinations
    await Destination.deleteMany({});
    console.log('✅ Cleared existing destinations');
    
    // Insert sample destinations
    const destinations = [
      {
        name: "Lalibela",
        location: "Lalibela",
        region: "Amhara",
        category: "historical",
        images: [
          "https://i.pinimg.com/736x/e6/c6/6d/e6c66dd3d26469e205da54776ef0259c.jpg"
        ],
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
        images: [
          "https://i.pinimg.com/736x/65/97/de/6597debe2e191b470276cbe0171a9410.jpg"
        ],
        description: "UNESCO World Heritage site with stunning landscapes.",
        bestTime: "September to November",
        duration: "4-5 days",
        price: "3,500 - 6,000 ETB",
        priceLevel: "$$",
        rating: 4.8,
        activities: ["Trekking", "Wildlife Viewing", "Camping"]
      },
      {
        name: "Danakil Depression",
        location: "Danakil",
        region: "Afar",
        category: "adventure",
        images: [
          "https://i.pinimg.com/736x/03/e3/ac/03e3acfe27a68e8f12f356bbeb9a9d8c.jpg"
        ],
        description: "One of the hottest places on Earth with colorful sulfur springs.",
        bestTime: "November to February",
        duration: "3-4 days",
        price: "8,000 - 12,000 ETB",
        priceLevel: "$$$",
        rating: 4.7,
        activities: ["Volcano Hiking", "Salt Flats Tour", "Photography"]
      }
    ];
    
    const result = await Destination.insertMany(destinations);
    console.log(`✅ Inserted ${result.length} destinations`);
    
    res.json({ 
      success: true, 
      message: `✅ ${result.length} Destinations seeded successfully!`,
      count: result.length,
      destinations: result
    });
  } catch (error) {
    console.error('❌ Seed error:', error);
    res.status(500).json({ message: error.message, stack: error.stack });
  }
});

// Get all destinations
router.get('/', async (req, res) => {
  try {
    const destinations = await Destination.find();
    console.log(`📦 Found ${destinations.length} destinations`);
    res.json({ success: true, data: destinations, count: destinations.length });
  } catch (error) {
    console.error('Error fetching destinations:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get single destination
router.get('/:id', async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id);
    if (!destination) {
      return res.status(404).json({ message: 'Destination not found' });
    }
    res.json({ success: true, data: destination });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;