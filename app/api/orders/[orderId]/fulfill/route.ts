import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { OrderService } from "@/lib/services/order";
import { UserService } from "@/lib/services/user";

const orderService = new OrderService();
const userService = new UserService();

export async function POST(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse(
        JSON.stringify({ error: "You must be logged in" }), 
        { status: 401 }
      );
    }

    const user = await userService.findByEmail(session.user.email);
    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: "User not found" }), 
        { status: 404 }
      );
    }

    try {
      const updatedOrder = await orderService.fulfillOrder(params.orderId, user.id);
      return NextResponse.json({ 
        success: true, 
        data: updatedOrder 
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Unauthorized to fulfill this order") {
          return new NextResponse(
            JSON.stringify({ error: error.message }), 
            { status: 401 }
          );
        }
        if (error.message === "Order not found") {
          return new NextResponse(
            JSON.stringify({ error: error.message }), 
            { status: 404 }
          );
        }
      }
      throw error; // Re-throw unexpected errors
    }
  } catch (error) {
    console.error("[ORDER_FULFILL]", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }), 
      { status: 500 }
    );
  }
} 