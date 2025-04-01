import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

const prisma = new PrismaClient().$extends(withAccelerate());

export default prisma;


declare global {
  var globalPrisma: PrismaClient | undefined;
}

const prisma = global.globalPrisma || new PrismaClient({
  log: ["query"],
});

if (process.env.NODE_ENV !== "production") {
  global.globalPrisma = prisma;
}

export { prisma }; 