export const dynamic = 'force-dynamic';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ErrorMessage } from "@/components/ui/error-message";
import { EmptyState } from "@/components/ui/empty-state";
import { UserRole } from "@prisma/client";

export default async function OrdersPage() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || user.role !== UserRole.VOLUNTEER) {
      return null;
    }

    // Get all orders for listings managed by the volunteer
    const orders = await prisma.order.findMany({
      where: {
        listing: {
          volunteerId: session.user.id,
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

    if (orders.length === 0) {
      return (
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Orders</h2>
          </div>
          <EmptyState text="No orders found for your listings" />
        </div>
      );
    }

    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Orders</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => (
            <Card key={order.id} className="bg-white">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900">
                  {order.listing.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-900">Cause</p>
                    <p className="font-medium text-gray-900">
                      {order.listing.cause.title}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">Organization</p>
                    <p className="font-medium text-gray-900">
                      {order.listing.cause.organization.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">Order Date</p>
                    <p className="font-medium text-gray-900">
                      {format(new Date(order.createdAt), "PPP")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">Status</p>
                    <Badge
                      variant={
                        order.fulfillmentStatus === "FULFILLED"
                          ? "success"
                          : "default"
                      }
                    >
                      {order.fulfillmentStatus}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  } catch (error) {
    console.error("[ORDERS_PAGE_ERROR]", error);
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ErrorMessage text="Failed to load orders" />
      </div>
    );
  }
} 