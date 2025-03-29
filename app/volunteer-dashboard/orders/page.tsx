import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { notFound } from "next/navigation";
import { FulfillOrderButton } from "./fulfill-order-button";

export default async function VolunteerOrders() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    notFound();
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    notFound();
  }

  // Get all orders for listings assigned to this volunteer
  const orders = await prisma.order.findMany({
    where: {
      listing: {
        volunteerId: user.id,
      },
    },
    include: {
      listing: {
        include: {
          cause: {
            include: {
              organization: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">All Orders</h2>
          <p className="text-gray-900">
            View and manage all orders for your assigned listings
          </p>
        </div>
      </div>

      <Card className="bg-white">
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">Listing</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">Cause</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">Buyer</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">Order Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b last:border-0">
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-900">{order.listing.title}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-900">{order.listing.cause.title}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-900">{order.buyerEmail}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm capitalize text-gray-900">
                        {order.fulfillmentStatus.toLowerCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-900">
                        {format(new Date(order.createdAt), "PPP")}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <FulfillOrderButton order={order} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 