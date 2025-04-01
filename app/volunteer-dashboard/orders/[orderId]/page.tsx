import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { OrderStatus } from "@prisma/client";
import { updateOrderStatus } from "../actions";

interface PageProps {
  params: {
    orderId: string;
  };
}

export default async function OrderDetailsPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return notFound();

  const order = await prisma.order.findUnique({
    where: { id: params.orderId },
    include: {
      listing: { select: { title: true } },
    },
  });

  if (!order) return notFound();

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
          <strong>Buyer Email:</strong> {order.buyerEmail}
          </div>
          <div>
            <strong>Listing:</strong> {order.listing?.title}
          </div>
          <div>
            <strong>Created:</strong>{" "}
            {format(new Date(order.createdAt), "PPP p")}
          </div>
          <div>
            <strong>Status:</strong>{" "}
            <Badge>{order.fulfillmentStatus}</Badge>
          </div>

          {order.fulfillmentStatus !== "FULFILLED" && (
            <form
              action={async () => {
                "use server";
                await updateOrderStatus(order.id, OrderStatus.FULFILLED);
              }}
            >
              <Button type="submit" variant="default">
                Mark as Fulfilled
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
