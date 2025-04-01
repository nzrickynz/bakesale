import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">
                    Listing
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">
                    Organization
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">
                    Cause
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">
                    Buyer Email
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">
                    Order Date
                  </th>
                </tr>
              </thead>
              <tbody>
                <div className="space-y-4">
                  {orders?.map((order) => (
                    <tr key={order.id} className="border-b last:border-0">
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-900">
                          {order.listing.title}
                        </span>
                        <span className="text-sm text-gray-600 block">
                          ${order.listing.price}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-900">
                          {order.listing.cause.organization.name}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-900">
                          {order.listing.cause.title}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-900">
                          {order.buyerEmail}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            order.fulfillmentStatus === "ORDERED"
                              ? "warning"
                              : order.fulfillmentStatus === "FULFILLED"
                              ? "success"
                              : "default"
                          }
                        >
                          {order.fulfillmentStatus}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-900">
                          {format(new Date(order.createdAt), "PPP")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </div>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 