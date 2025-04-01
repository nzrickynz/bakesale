import prisma from "@/lib/prisma";

async function main() {
  // Create a test order
  const order = await prisma.order.create({
    data: {
      buyerEmail: "test@example.com",
      fulfillmentStatus: "ORDERED",
      listing: {
        connect: {
          id: "test-listing-id", // Replace with an actual listing ID
        },
      },
      creator: {
        connect: {
          id: "test-user-id", // Replace with an actual user ID
        },
      },
    },
  });

  console.log("Created test order:", order);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 