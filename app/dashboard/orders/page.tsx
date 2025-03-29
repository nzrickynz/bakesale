import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { notFound } from "next/navigation";
import { CheckCircle, XCircle } from "lucide-react";
import { UserRole } from "@prisma/client";

interface Order {
  id: string;
  buyerEmail: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  createdAt: Date;
  listing: {
    id: string;
    title: string;
    price: number;
    cause: {
      id: string;
      title: string;
      organization: {
        id: string;
        name: string;
      };
    };
  };
}

export default async function OrdersPage() {
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

  // Get all organizations where the user is an admin
  const userOrganizations = await prisma.userOrganization.findMany({
    where: {
      userId: user.id,
      role: UserRole.ORG_ADMIN,
    },
    include: {
      organization: true,
    },
  });

  if (userOrganizations.length === 0) {
    notFound();
  }

  // Get all orders for the organizations where the user is an admin
  const orders = await prisma.order.findMany({
    where: {
      listing: {
        cause: {
          organizationId: {
            in: userOrganizations.map((uo) => uo.organizationId),
          },
        },
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
  }) as unknown as Order[];

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">All Orders</h2>
          <p className="text-gray-900">
            View and manage all orders across your organizations
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
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">Organization</th>
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
                      <span className="text-sm text-gray-600 block">${order.listing.price}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-900">{order.listing.cause.organization.name}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-900">{order.listing.cause.title}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-900">{order.buyerEmail}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          order.fulfillmentStatus === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.fulfillmentStatus === "IN_PROGRESS"
                            ? "bg-blue-100 text-blue-800"
                            : order.fulfillmentStatus === "FULFILLED"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {order.fulfillmentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-900">
                        {format(new Date(order.createdAt), "PPP")}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        {order.fulfillmentStatus === "PENDING" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                try {
                                  await prisma.order.update({
                                    where: { id: order.id },
                                    data: { fulfillmentStatus: "IN_PROGRESS" },
                                  });
                                  window.location.reload();
                                } catch (err) {
                                  console.error("Failed to update order status:", err);
                                }
                              }}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Start Progress
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                try {
                                  await prisma.order.update({
                                    where: { id: order.id },
                                    data: { fulfillmentStatus: "CANCELLED" },
                                  });
                                  window.location.reload();
                                } catch (err) {
                                  console.error("Failed to cancel order:", err);
                                }
                              }}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Cancel
                            </Button>
                          </>
                        )}
                        {order.fulfillmentStatus === "IN_PROGRESS" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              try {
                                await prisma.order.update({
                                  where: { id: order.id },
                                  data: { fulfillmentStatus: "FULFILLED" },
                                });
                                window.location.reload();
                              } catch (err) {
                                console.error("Failed to complete order:", err);
                              }
                            }}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Complete
                          </Button>
                        )}
                      </div>
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