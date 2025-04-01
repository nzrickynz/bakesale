import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image } from "@/components/ui/image";
import Link from "next/link";
import { Facebook, Instagram, Globe } from "lucide-react";

interface Cause {
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
  listings: {
    id: string;
    title: string;
    description: string;
    price: number;
    imageUrl: string | null;
    volunteer: {
      id: string;
      name: string | null;
      image: string | null;
    } | null;
  }[];
}

interface PageProps {
  params: {
    causeId: string;
  };
}

export default async function CausePage({ params }: PageProps) {
  const cause = await prisma.cause.findUnique({
    where: { 
      id: params.causeId,
      status: "ACTIVE"
    },
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
      listings: {
        include: {
          volunteer: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      },
    },
  }) as Cause | null;

  if (!cause) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#F7F6F3] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cause Header */}
        <div className="mb-12">
          {cause.imageUrl && (
            <div className="relative h-96 rounded-lg overflow-hidden mb-8">
              <Image
                src={cause.imageUrl}
                alt={cause.title}
                fill
                className="object-cover"
              />
            </div>
          )}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {cause.title}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl">
            {cause.description}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Listings */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Available Items
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cause.listings.map((listing) => (
                <Card key={listing.id} className="overflow-hidden">
                  {listing.imageUrl && (
                    <div className="relative h-48">
                      <Image
                        src={listing.imageUrl}
                        alt={listing.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{listing.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {listing.description}
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-[#E55937]">
                        ${listing.price}
                      </span>
                      {listing.volunteer && (
                        <div className="flex items-center gap-2">
                          {listing.volunteer.image && (
                            <div className="relative w-8 h-8 rounded-full overflow-hidden">
                              <Image
                                src={listing.volunteer.image}
                                alt={listing.volunteer.name || "Volunteer"}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <span className="text-sm text-gray-500">
                            by {listing.volunteer.name || "Anonymous"}
                          </span>
                        </div>
                      )}
                    </div>
                    <Button asChild className="w-full">
                      <Link href={`/causes/${cause.id}/listings/${listing.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar - Organization Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  {cause.organization.logoUrl && (
                    <div className="relative w-12 h-12 rounded-full overflow-hidden">
                      <Image
                        src={cause.organization.logoUrl}
                        alt={cause.organization.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <CardTitle>{cause.organization.name}</CardTitle>
                    <p className="text-sm text-gray-500">
                      Organization
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">
                  {cause.organization.description}
                </p>
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">
                    Connect with {cause.organization.name}
                  </h3>
                  <div className="flex gap-4">
                    {cause.organization.facebookUrl && (
                      <a
                        href={cause.organization.facebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-[#E55937]"
                      >
                        <Facebook className="w-6 h-6" />
                      </a>
                    )}
                    {cause.organization.instagramUrl && (
                      <a
                        href={cause.organization.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-[#E55937]"
                      >
                        <Instagram className="w-6 h-6" />
                      </a>
                    )}
                    {cause.organization.websiteUrl && (
                      <a
                        href={cause.organization.websiteUrl}
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