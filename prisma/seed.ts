import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create super admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@bakesale.com' },
    update: {},
    create: {
      email: 'admin@bakesale.com',
      passwordHash: hashedPassword,
      role: UserRole.SUPER_ADMIN,
    },
  });

  // Create organization admin user
  const orgAdmin = await prisma.user.upsert({
    where: { email: 'orgadmin@bakesale.com' },
    update: {},
    create: {
      email: 'orgadmin@bakesale.com',
      passwordHash: hashedPassword,
      role: UserRole.ORG_ADMIN,
    },
  });

  // Create organizations
  const foodBank = await prisma.organization.create({
    data: {
      name: 'Local Food Bank',
      description: 'Providing food security to our community',
      adminId: orgAdmin.id,
      userOrganizations: {
        create: [
          {
            userId: orgAdmin.id,
            role: UserRole.ORG_ADMIN,
          },
          {
            userId: superAdmin.id,
            role: UserRole.SUPER_ADMIN,
          },
        ],
      },
    },
  });

  const animalRescue = await prisma.organization.create({
    data: {
      name: 'Animal Rescue Center',
      description: 'Helping animals find their forever homes',
      adminId: orgAdmin.id,
      userOrganizations: {
        create: [
          {
            userId: orgAdmin.id,
            role: UserRole.ORG_ADMIN,
          },
          {
            userId: superAdmin.id,
            role: UserRole.SUPER_ADMIN,
          },
        ],
      },
    },
  });

  // Create causes
  const foodDrive = await prisma.cause.create({
    data: {
      title: 'Summer Food Drive',
      description: 'Help us provide food for families in need this summer',
      targetGoal: 5000,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      organizationId: foodBank.id,
    },
  });

  const petCare = await prisma.cause.create({
    data: {
      title: 'Pet Care Fund',
      description: 'Support medical care for rescued animals',
      targetGoal: 3000,
      startDate: new Date(),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
      organizationId: animalRescue.id,
    },
  });

  // Create listings
  await prisma.listing.create({
    data: {
      title: "Chocolate Chip Cookies",
      description: "Classic homemade chocolate chip cookies",
      price: 5.00,
      quantity: 20,
      paymentLink: "https://example.com/pay",
      cause: {
        connect: { id: foodDrive.id }
      },
      volunteer: {
        connect: { id: orgAdmin.id }
      }
    }
  });

  await prisma.listing.create({
    data: {
      title: "Brownies",
      description: "Fudgy chocolate brownies",
      price: 8.00,
      quantity: 15,
      paymentLink: "https://example.com/pay",
      cause: {
        connect: { id: foodDrive.id }
      },
      volunteer: {
        connect: { id: orgAdmin.id }
      }
    }
  });

  await prisma.listing.create({
    data: {
      title: 'Homemade Dog Treats',
      description: 'Healthy, homemade treats for your furry friends',
      price: 12,
      quantity: 25,
      imageUrl: '/placeholder.svg?height=300&width=300',
      causeId: petCare.id,
      volunteerId: orgAdmin.id,
    },
  });

  // Create donations
  await prisma.donation.create({
    data: {
      amount: 1000,
      status: 'COMPLETED',
      causeId: foodDrive.id,
    },
  });

  await prisma.donation.create({
    data: {
      amount: 500,
      status: 'COMPLETED',
      causeId: petCare.id,
    },
  });

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 