import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');
  
  // Create a test user
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      fullname: 'Test User',
      username: 'testuser',
      email: 'test@example.com',
      password: hashedPassword,
      birthdate: new Date('1990-01-01'),
      location: 'Addis Ababa'
    }
  });
  
  console.log('✅ Created user:', user.email);
  
  // Create destinations
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
    },
    {
      name: "Danakil Depression",
      location: "Danakil",
      region: "Afar",
      category: "adventure",
      images: ["https://i.pinimg.com/736x/03/e3/ac/03e3acfe27a68e8f12f356bbeb9a9d8c.jpg"],
      description: "One of the hottest places on Earth with colorful sulfur springs.",
      bestTime: "November to February",
      duration: "3-4 days",
      price: "8,000 - 12,000 ETB",
      priceLevel: "$$$",
      rating: 4.7,
      activities: ["Volcano Hiking", "Salt Flats Tour", "Photography"]
    }
  ];
  
  for (const dest of destinations) {
    await prisma.destination.upsert({
      where: { id: dest.name },
      update: {},
      create: dest
    });
  }
  
  console.log(`✅ Created ${destinations.length} destinations`);
}

main()
  .catch(e => {
    console.error('❌ Error seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
  