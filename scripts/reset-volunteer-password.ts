import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'volunteer@reallycoolorg.org';
  const newPassword = 'pass1234';

  try {
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error('User not found');
      return;
    }

    // Hash the new password
    const hashedPassword = await hash(newPassword, 12);

    // Update the user's password
    await prisma.user.update({
      where: { email },
      data: {
        passwordHash: hashedPassword,
      },
    });

    console.log('Password reset successfully');
  } catch (error) {
    console.error('Error resetting password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 