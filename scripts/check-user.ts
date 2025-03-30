import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = "nzricky@gmail.com"; // Your email
  
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (user) {
      console.log("User found:", user);
    } else {
      console.log("User not found");
    }
  } catch (error) {
    console.error("Error checking user:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 