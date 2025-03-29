import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Verify the order belongs to a listing managed by this volunteer
    const order = await prisma.order.findUnique({
      where: { id: params.orderId },
      include: {
        listing: true,
      },
    });

    if (!order) {
      return new NextResponse("Order not found", { status: 404 });
    }

    if (order.listing.volunteerId !== user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Update the order status to fulfilled
    const updatedOrder = await prisma.order.update({
      where: { id: params.orderId },
      data: {
        fulfillmentStatus: "FULFILLED",
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("[ORDER_FULFILL]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 