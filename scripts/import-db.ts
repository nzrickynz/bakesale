import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function run() {
  try {
    const snapshotPath = path.join(process.cwd(), 'prisma', 'snapshot.json');
    
    if (!fs.existsSync(snapshotPath)) {
      console.error('❌ No snapshot file found at prisma/snapshot.json');
      process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));

    // Delete existing data in reverse order of dependencies
    await prisma.$transaction([
      prisma.order.deleteMany(),
      prisma.listing.deleteMany(),
      prisma.cause.deleteMany(),
      prisma.volunteerInvitation.deleteMany(),
      prisma.passwordReset.deleteMany(),
      prisma.userOrganization.deleteMany(),
      prisma.organization.deleteMany(),
      prisma.user.deleteMany(),
    ]);

    // Create data in order of dependencies
    await prisma.$transaction([
      prisma.user.createMany({ data: data.users }),
      prisma.organization.createMany({ data: data.organizations }),
      prisma.cause.createMany({ data: data.causes }),
      prisma.listing.createMany({ data: data.listings }),
      prisma.order.createMany({ data: data.orders }),
      prisma.userOrganization.createMany({ data: data.userOrganizations }),
      prisma.volunteerInvitation.createMany({ data: data.volunteerInvitations }),
      prisma.passwordReset.createMany({ data: data.passwordResets }),
    ]);

    console.log('✅ DB restored from prisma/snapshot.json');
  } catch (error) {
    console.error('Error importing database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

run(); 