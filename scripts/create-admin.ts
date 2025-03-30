import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      console.error('Please provide ADMIN_EMAIL and ADMIN_PASSWORD environment variables');
      process.exit(1);
    }

    const hashedPassword = await hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        role: 'SUPER_ADMIN',
      },
    });

    console.log('Admin user created:', user);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 