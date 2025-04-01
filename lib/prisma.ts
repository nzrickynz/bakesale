// lib/prisma.ts
import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

declare global {
  // Prevent redeclaration during hot reloads in dev
  // This is the Accelerate-extended PrismaClient
  var prisma: ReturnType<typeof withAccelerate<PrismaClient>> | undefined;
}

// Extend the Prisma client with Accelerate
const prisma =
  globalThis.prisma ?? withAccelerate(new PrismaClient());

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export default prisma;
