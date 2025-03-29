import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const listingId = "cm8tmsipo000f11pcbl2jdhod";
  
  try {
    // First verify the listing exists
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      console.error("Listing not found");
      return;
    }

    // Create a test order
    const order = await prisma.order.create({
      data: {
        listingId: listingId,
        buyerEmail: "test.buyer@example.com",
        fulfillmentStatus: "PENDING",
        paymentStatus: "PAID",
        creatorId: listing.volunteerId,
      },
    });

    console.log("Test order created successfully:", order);
  } catch (error) {
    console.error("Error creating test order:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 