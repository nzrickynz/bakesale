import { PrismaClient, UserRole, CauseCategory, OrderStatus, CauseStatus } from '@prisma/client';
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

  // Create an organization with enhanced data
  const organization = await prisma.organization.upsert({
    where: { name: 'Bake for Good' },
    update: {},
    create: {
      name: 'Bake for Good',
      description: 'A community-driven organization focused on making a difference through baking.',
      logoUrl: 'https://placehold.co/300x300',
      facebookUrl: 'https://facebook.com/bakeforgood',
      instagramUrl: 'https://instagram.com/bakeforgood',
      websiteUrl: 'https://bakeforgood.org',
      admin: {
        connect: { id: superAdmin.id }
      }
    },
  });

  // Create volunteers
  const volunteers = await Promise.all([
    prisma.user.upsert({
      where: { email: 'volunteer1@example.com' },
      update: {},
      create: {
        email: 'volunteer1@example.com',
        name: 'Jane Dough',
        passwordHash: await hash('password123', 12),
        role: 'VOLUNTEER',
      },
    }),
    prisma.user.upsert({
      where: { email: 'volunteer2@example.com' },
      update: {},
      create: {
        email: 'volunteer2@example.com',
        name: 'John Baker',
        passwordHash: await hash('password123', 12),
        role: 'VOLUNTEER',
      },
    }),
  ]);

  // Create sample causes with enhanced data
  const causes = [
    {
      title: 'Support Local Food Banks',
      description: 'Help provide food to families in need through our network of local food banks.',
      imageUrl: 'https://placehold.co/800x400',
      organizationId: organization.id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      targetGoal: 5000,
      category: CauseCategory.FOOD,
      status: CauseStatus.ACTIVE,
    },
    {
      title: 'Education for All',
      description: 'Support educational initiatives that help children access quality education.',
      imageUrl: 'https://placehold.co/800x400',
      organizationId: organization.id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
      targetGoal: 7500,
      category: CauseCategory.SERVICES,
      status: CauseStatus.ACTIVE,
    },
    {
      title: 'Environmental Conservation',
      description: 'Fund projects that protect and preserve our environment for future generations.',
      imageUrl: 'https://placehold.co/800x400',
      organizationId: organization.id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
      targetGoal: 10000,
      category: CauseCategory.SERVICES,
      status: CauseStatus.ACTIVE,
    },
  ];

  const createdCauses = await Promise.all(
    causes.map(cause =>
      prisma.cause.upsert({
        where: { title: cause.title },
        update: {},
        create: cause,
      })
    )
  );

  // Create listings for each cause
  for (const cause of createdCauses) {
    const listings = [
      {
        title: `Homemade Brownies for ${cause.title}`,
        description: 'Delicious homemade brownies made with love.',
        imageUrl: 'https://placehold.co/300x300',
        price: 25,
        quantity: 10,
        stripeProductId: `prod_${cause.id.slice(0, 8)}_001`,
        stripePriceId: `price_${cause.id.slice(0, 8)}_001`,
        causeId: cause.id,
        volunteerId: volunteers[0].id,
      },
      {
        title: `Custom Cake for ${cause.title}`,
        description: 'Beautiful custom cake with your choice of flavors.',
        imageUrl: 'https://placehold.co/300x300',
        price: 50,
        quantity: 5,
        stripeProductId: `prod_${cause.id.slice(0, 8)}_002`,
        stripePriceId: `price_${cause.id.slice(0, 8)}_002`,
        causeId: cause.id,
        volunteerId: volunteers[1].id,
      },
      {
        title: `Cookie Box for ${cause.title}`,
        description: 'Assorted cookies in a beautiful gift box.',
        imageUrl: 'https://placehold.co/300x300',
        price: 35,
        quantity: 15,
        stripeProductId: `prod_${cause.id.slice(0, 8)}_003`,
        stripePriceId: `price_${cause.id.slice(0, 8)}_003`,
        causeId: cause.id,
        volunteerId: volunteers[0].id,
      },
    ];

    await prisma.listing.createMany({
      data: listings,
    });

    // Create some orders for each listing
    const createdListings = await prisma.listing.findMany({
      where: { causeId: cause.id },
    });

    for (const listing of createdListings) {
      const orders = [
        {
          buyerEmail: 'customer1@example.com',
          fulfillmentStatus: OrderStatus.ORDERED,
          listingId: listing.id,
          creatorId: volunteers[0].id,
        },
        {
          buyerEmail: 'customer2@example.com',
          fulfillmentStatus: OrderStatus.IN_PROGRESS,
          listingId: listing.id,
          creatorId: volunteers[1].id,
        },
      ];

      await prisma.order.createMany({
        data: orders,
      });
    }
  }

  // Create user-organization relationships for volunteers
  await Promise.all(
    volunteers.map(volunteer =>
      prisma.userOrganization.upsert({
        where: {
          userId_organizationId: {
            userId: volunteer.id,
            organizationId: organization.id,
          },
        },
        update: {},
        create: {
          userId: volunteer.id,
          organizationId: organization.id,
          role: UserRole.VOLUNTEER,
        },
      })
    )
  );

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