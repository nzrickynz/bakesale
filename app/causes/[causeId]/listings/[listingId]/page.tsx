import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image } from "@/components/ui/image";
import Link from "next/link";
import { Facebook, Instagram, Globe, ArrowLeft } from "lucide-react";
import { createCheckoutSession } from "@/lib/stripe";
import { redirect } from "next/navigation";

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string | null;
  volunteer: {
    id: string;
    name: string | null;
    image: string | null;
    bio: string | null;
  } | null;
  cause: {
    id: string;
    title: string;
    description: string;
    imageUrl: string | null;
    organization: {
      id: string;
      name: string;
      description: string;
      logoUrl: string | null;
      facebookUrl: string | null;
      instagramUrl: string | null;
      websiteUrl: string | null;
    };
  };
}

interface PageProps {
  params: {
    causeId: string;
    listingId: string;
  };
}

export default async function ListingPage({ params }: PageProps) {
  const listing = await prisma.listing.findUnique({
    where: { id: params.listingId },
    include: {
      volunteer: {
        select: {
          id: true,
          name: true,
          image: true,
          bio: true,
        },
      },
      cause: {
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              description: true,
              logoUrl: true,
              facebookUrl: true,
              instagramUrl: true,
              websiteUrl: true,
            },
          },
        },
      },
    },
  }) as Listing | null;

  if (!listing) {
    notFound();
  }

  const listingId = listing.id;

  async function createCheckout() {
    "use server";
    const session = await createCheckoutSession(listingId);
    if (!session?.url) {
      throw new Error("Failed to create checkout session");
    }
    redirect(session.url);
  }

  return (
    <div className="min-h-screen bg-[#F7F6F3] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href={`/causes/${listing.cause.id}`}
          className="inline-flex items-center text-gray-600 hover:text-[#E55937] mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Cause
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Listing Details */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              {listing.imageUrl && (
                <div className="relative h-96">
                  <Image
                    src={listing.imageUrl}
                    alt={listing.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-3xl">{listing.title}</CardTitle>
                <div className="flex items-center gap-3">
                  {listing.volunteer?.image && (
                    <div className="relative w-10 h-10 rounded-full overflow-hidden">
                      <Image
                        src={listing.volunteer.image}
                        alt={listing.volunteer.name || "Volunteer"}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500">
                      by {listing.volunteer?.name || "Anonymous"}
                    </p>
                    <p className="text-sm text-gray-500">
                      Supporting {listing.cause.title}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none mb-8">
                  <p className="text-gray-600">{listing.description}</p>
                </div>
                {listing.volunteer?.bio && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      About the Baker
                    </h3>
                    <p className="text-gray-600">{listing.volunteer.bio}</p>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-[#E55937]">
                    ${listing.price}
                  </span>
                  <form action={createCheckout}>
                    <Button size="lg" className="bg-[#E55937] hover:bg-[#E55937]/90">
                      Buy Now
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Cause & Organization Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Cause Card */}
            <Card>
              <CardHeader>
                <CardTitle>About the Cause</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  {listing.cause.description}
                </p>
                <Link
                  href={`/causes/${listing.cause.id}`}
                  className="text-[#E55937] hover:text-[#E55937]/90"
                >
                  Learn more about this cause →
                </Link>
              </CardContent>
            </Card>

            {/* Organization Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  {listing.cause.organization.logoUrl && (
                    <div className="relative w-12 h-12 rounded-full overflow-hidden">
                      <Image
                        src={listing.cause.organization.logoUrl}
                        alt={listing.cause.organization.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <CardTitle>{listing.cause.organization.name}</CardTitle>
                    <p className="text-sm text-gray-500">
                      Organization
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">
                  {listing.cause.organization.description}
                </p>
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">
                    Connect with {listing.cause.organization.name}
                  </h3>
                  <div className="flex gap-4">
                    {listing.cause.organization.facebookUrl && (
                      <a
                        href={listing.cause.organization.facebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-[#E55937]"
                      >
                        <Facebook className="w-6 h-6" />
                      </a>
                    )}
                    {listing.cause.organization.instagramUrl && (
                      <a
                        href={listing.cause.organization.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-[#E55937]"
                      >
                        <Instagram className="w-6 h-6" />
                      </a>
                    )}
                    {listing.cause.organization.websiteUrl && (
                      <a
                        href={listing.cause.organization.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-[#E55937]"
                      >
                        <Globe className="w-6 h-6" />
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 