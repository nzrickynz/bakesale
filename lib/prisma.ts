import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

declare global {
  var globalPrisma: ReturnType<typeof prismaClientSingleton> | undefined;
}

const prismaClientSingleton = () => {
  return new PrismaClient().$extends(withAccelerate());
};

const prisma = global.globalPrisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  global.globalPrisma = prisma;
}

export { prisma }; 