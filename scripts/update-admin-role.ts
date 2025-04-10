import prisma from "@/lib/prisma";

async function main() {
  const email = "admin@bakesale.com";
  
  // Find the user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.log("User not found");
    return;
  }

  // Update user role to ORG_ADMIN
  await prisma.user.update({
    where: { id: user.id },
    data: {
      role: "ORG_ADMIN",
    },
  });

  // Create an organization if it doesn't exist
  const organization = await prisma.organization.upsert({
    where: { id: "bakesale-admin-org" },
    create: {
      id: "bakesale-admin-org",
      name: "BakeSale Admin Organization",
      description: "Organization for BakeSale administrators",
      adminId: user.id,
    },
    update: {},
  });

  // Create a UserOrganization relationship
  await prisma.userOrganization.upsert({
    where: {
      userId_organizationId: {
        userId: user.id,
        organizationId: organization.id,
      },
    },
    update: {
      role: "ORG_ADMIN",
    },
    create: {
      userId: user.id,
      organizationId: organization.id,
      role: "ORG_ADMIN",
    },
  });

  console.log("Successfully updated user role and created organization");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 