import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function run() {
  try {
    const data = {
      users: await prisma.user.findMany(),
      organizations: await prisma.organization.findMany(),
      causes: await prisma.cause.findMany(),
      listings: await prisma.listing.findMany(),
      orders: await prisma.order.findMany(),
      userOrganizations: await prisma.userOrganization.findMany(),
      volunteerInvitations: await prisma.volunteerInvitation.findMany(),
      passwordResets: await prisma.passwordReset.findMany(),
    };

    // Create prisma directory if it doesn't exist
    const prismaDir = path.join(process.cwd(), 'prisma');
    if (!fs.existsSync(prismaDir)) {
      fs.mkdirSync(prismaDir);
    }

    // Write the snapshot file
    const snapshotPath = path.join(prismaDir, 'snapshot.json');
    fs.writeFileSync(snapshotPath, JSON.stringify(data, null, 2));
    console.log('✅ DB snapshot exported to prisma/snapshot.json');
  } catch (error) {
    console.error('Error exporting database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

run(); 