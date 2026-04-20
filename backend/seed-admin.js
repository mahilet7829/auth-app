import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const createAdmin = async () => {
  try {
    console.log('🔍 Checking for admin user...');
    
    const adminExists = await prisma.user.findUnique({
      where: { email: 'admin@example.com' }
    });
    
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await prisma.user.create({
        data: {
          fullname: 'Admin User',
          username: 'admin',
          email: 'admin@example.com',
          password: hashedPassword,
          location: 'Addis Ababa',
          birthdate: new Date('1990-01-01'),
          role: 'admin'
        }
      });
      console.log('✅ Admin user created successfully!');
      console.log('📧 Email: admin@example.com');
      console.log('🔑 Password: admin123');
    } else {
      console.log('⚠️ Admin user already exists');
    }
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
  } finally {
    await prisma.$disconnect();
  }
};

createAdmin();