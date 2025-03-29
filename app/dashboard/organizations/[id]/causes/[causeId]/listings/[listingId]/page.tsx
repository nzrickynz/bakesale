import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image } from "@/components/ui/image";
import { toast } from "sonner";

interface PageProps {
  params: {
    id: string;
    causeId: string;
    listingId: string;
  };
}

interface UserOrganization {
  id: string;
  userId: string;
  organizationId: string;
  role: "ADMIN" | "VOLUNTEER";
  organization: {
    id: string;
    name: string;
  };
}

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  causeId: string;
  volunteerId: string | null;
  cause: {
    title: string;
  };
  volunteer: {
    name: string | null;
    email: string;
  } | null;
  orders: {
    id: string;
    status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
    createdAt: Date;
    buyerName: string;
    buyerEmail: string;
  }[];
}

async function createCheckoutSession(listingId: string) {
  "use server";
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ listingId }),
    });

    if (!response.ok) {
      throw new Error("Failed to create checkout session");
    }

    const { url } = await response.json();
    return url;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
}

export default async function ListingDetailsPage({ params }: PageProps) {
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

  const userOrganization = await prisma.userOrganization.findFirst({
    where: {
      userId: user.id,
      organizationId: params.id,
    },
    include: {
      organization: true,
    },
  }) as UserOrganization | null;

  if (!userOrganization) {
    notFound();
  }

  const listing = await prisma.listing.findUnique({
    where: {
      id: params.listingId,
    },
    include: {
      cause: {
        select: {
          title: true,
        },
      },
      volunteer: {
        select: {
          name: true,
          email: true,
        },
      },
      orders: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  }) as Listing | null;

  if (!listing) {
    notFound();
  }

  const isAdmin = userOrganization.role === "ADMIN";
  const isVolunteer = listing.volunteerId === user.id;

  if (!isAdmin && !isVolunteer) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{listing.title}</h2>
          <p className="text-muted-foreground">
            Listing for {listing.cause.title}
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => {
              window.location.href = `/dashboard/organizations/${params.id}/causes/${params.causeId}/listings/${params.listingId}/edit`;
            }}
          >
            Edit Listing
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Listing Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {listing.imageUrl && (
              <div className="relative aspect-video overflow-hidden rounded-lg">
                <Image
                  src={listing.imageUrl}
                  alt={listing.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div>
              <h3 className="font-semibold">Description</h3>
              <p className="text-muted-foreground">{listing.description}</p>
            </div>
            <div>
              <h3 className="font-semibold">Price</h3>
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">${listing.price.toFixed(2)}</p>
                <Button
                  onClick={async () => {
                    try {
                      const url = await createCheckoutSession(listing.id);
                      window.location.href = url;
                    } catch (error) {
                      toast.error("Failed to create checkout session");
                    }
                  }}
                >
                  Buy Now
                </Button>
              </div>
            </div>
            <div>
              <h3 className="font-semibold">Volunteer</h3>
              <p className="text-muted-foreground">
                {listing.volunteer
                  ? listing.volunteer.name || listing.volunteer.email
                  : "Unassigned"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {listing.orders.length === 0 ? (
                <p className="text-muted-foreground">No orders yet</p>
              ) : (
                listing.orders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-lg border p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{order.buyerName}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.buyerEmail}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          order.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.status === "CONFIRMED"
                            ? "bg-blue-100 text-blue-800"
                            : order.status === "COMPLETED"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Ordered on{" "}
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    {(isAdmin || isVolunteer) && (
                      <div className="flex gap-2">
                        {order.status === "PENDING" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                try {
                                  await prisma.order.update({
                                    where: { id: order.id },
                                    data: { status: "CONFIRMED" },
                                  });
                                  toast.success("Order confirmed");
                                  window.location.reload();
                                } catch (err) {
                                  console.error("Failed to confirm order:", err);
                                  toast.error("Failed to confirm order");
                                }
                              }}
                            >
                              Confirm
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                try {
                                  await prisma.order.update({
                                    where: { id: order.id },
                                    data: { status: "CANCELLED" },
                                  });
                                  toast.success("Order cancelled");
                                  window.location.reload();
                                } catch (err) {
                                  console.error("Failed to cancel order:", err);
                                  toast.error("Failed to cancel order");
                                }
                              }}
                            >
                              Cancel
                            </Button>
                          </>
                        )}
                        {order.status === "CONFIRMED" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              try {
                                await prisma.order.update({
                                  where: { id: order.id },
                                  data: { status: "COMPLETED" },
                                });
                                toast.success("Order completed");
                                window.location.reload();
                              } catch (err) {
                                console.error("Failed to complete order:", err);
                                toast.error("Failed to complete order");
                              }
                            }}
                          >
                            Complete
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 