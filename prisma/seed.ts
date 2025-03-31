import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create a super admin user
  const superAdminPassword = await hash('admin123', 12);
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Super Admin',
      passwordHash: superAdminPassword,
      role: 'SUPER_ADMIN',
    },
  });

  // Create an organization
  const organization = await prisma.organization.upsert({
    where: { name: 'Bake for Good' },
    update: {},
    create: {
      name: 'Bake for Good',
      description: 'A community-driven organization focused on making a difference through baking.',
      admin: {
        connect: { id: superAdmin.id }
      }
    },
  });

  // Create sample causes
  const causes = [
    {
      title: 'Support Local Food Banks',
      description: 'Help provide food to families in need through our network of local food banks.',
      organizationId: organization.id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      targetGoal: 5000,
    },
    {
      title: 'Education for All',
      description: 'Support educational initiatives that help children access quality education.',
      organizationId: organization.id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
      targetGoal: 7500,
    },
    {
      title: 'Environmental Conservation',
      description: 'Fund projects that protect and preserve our environment for future generations.',
      organizationId: organization.id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
      targetGoal: 10000,
    },
  ];

  for (const cause of causes) {
    await prisma.cause.upsert({
      where: { title: cause.title },
      update: {},
      create: cause,
    });
  }

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