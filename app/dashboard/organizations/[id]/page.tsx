import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Heart, Settings, ArrowRight } from "lucide-react";
import { ErrorMessage } from "@/components/ui/error-message";
import { EmptyState } from "@/components/ui/empty-state";
import { OrganizationEditForm } from '@/components/forms/OrganizationEditForm';
import { toast } from "react-hot-toast";

interface PageProps {
  params: {
    id: string;
  };
}

interface UserOrganization {
  id: string;
  role: string;
  organization: {
    id: string;
    name: string;
    description: string | null;
    website: string | null;
    logoUrl: string | null;
    websiteUrl: string | null;
    facebookUrl: string | null;
    instagramUrl: string | null;
    causes: {
      id: string;
      title: string;
      description: string;
      currentAmount: number;
    }[];
  };
}

interface Cause {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  targetGoal: number | null;
  startDate: Date;
  endDate: Date | null;
  status: string;
  organizationId: string;
  organization: {
    id: string;
    name: string;
  };
  listings?: {
    price: number;
    orders: any[];
  }[];
}

interface CauseWithAmount extends Cause {
  currentAmount: number;
}

export default async function OrganizationPage({ params }: PageProps) {
  try {
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

    const causes = await prisma.cause.findMany({
      where: {
        organizationId: params.id,
      },
      include: {
        organization: true,
        listings: {
          select: {
            price: true,
            orders: {
              select: {
                id: true,
                buyerEmail: true,
                fulfillmentStatus: true,
              },
            },
          },
        },
      },
    }) as Cause[];

    // Calculate current amount for each cause
    const causesWithAmounts = causes?.map((cause: Cause) => ({
      ...cause,
      currentAmount: cause.listings?.reduce((acc: number, listing) => 
        acc + (listing.price * (listing.orders?.length || 0)), 0) || 0
    })) ?? [];

    // Calculate total amount raised
    const totalAmount = causesWithAmounts.reduce((acc, cause) => acc + cause.currentAmount, 0);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Organization Dashboard</h1>
          <Button asChild>
            <Link href={`/dashboard/organizations/${params.id}/causes/new`}>
              Create New Cause
            </Link>
          </Button>
        </div>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-gray-900">Organization Information</CardTitle>
          </CardHeader>
          <CardContent>
            <OrganizationEditForm 
              organization={{
                id: userOrganization.organization.id,
                name: userOrganization.organization.name,
                description: userOrganization.organization.description || '',
                logoUrl: userOrganization.organization.logoUrl,
                websiteUrl: userOrganization.organization.websiteUrl,
                facebookUrl: userOrganization.organization.facebookUrl,
                instagramUrl: userOrganization.organization.instagramUrl,
              }}
              onSubmit={async (data) => {
                'use server';
                try {
                  await prisma.organization.update({
                    where: { id: params.id },
                    data: {
                      name: data.name,
                      description: data.description,
                      logoUrl: data.logoUrl,
                      websiteUrl: data.websiteUrl || null,
                      facebookUrl: data.facebookUrl || null,
                      instagramUrl: data.instagramUrl || null,
                    },
                  });
                  toast.success('Organization updated successfully');
                } catch (error) {
                  console.error('Error updating organization:', error);
                  toast.error('Failed to update organization');
                }
              }}
            />
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-gray-900">Active Causes</CardTitle>
          </CardHeader>
          <CardContent>
            {userOrganization.organization.causes.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {userOrganization.organization.causes.map((cause) => (
                  <Card key={cause.id} className="bg-white">
                    <CardHeader>
                      <CardTitle className="text-gray-900">{cause.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-900">{cause.description}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-gray-900">${cause.currentAmount} raised</span>
                        <Button asChild>
                          <Link href={`/dashboard/organizations/${params.id}/causes/${cause.id}`}>
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-gray-900">No active causes yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    console.error("Error loading organization page:", error);
    return <ErrorMessage />;
  }
}