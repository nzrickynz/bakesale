import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image } from "@/components/ui/image";
import Link from "next/link";
import { Facebook, Instagram, Globe, ArrowLeft } from "lucide-react";

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string | null;
  paymentLink: string | null;
  volunteer: {
    id: string;
    name: string | null;
    image: string | null;
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Listing Image */}
          <div className="relative aspect-square rounded-lg overflow-hidden">
            {listing.imageUrl ? (
              <Image
                src={listing.imageUrl}
                alt={listing.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">No image</span>
              </div>
            )}
          </div>

          {/* Listing Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{listing.title}</h1>
              <p className="mt-2 text-xl text-[#E55937]">${listing.price}</p>
            </div>

            <div className="prose max-w-none">
              <p className="text-gray-600">{listing.description}</p>
            </div>

            {/* Volunteer Info */}
            {listing.volunteer && (
              <div className="flex items-center space-x-4">
                {listing.volunteer.image && (
                  <div className="relative w-12 h-12 rounded-full overflow-hidden">
                    <Image
                      src={listing.volunteer.image}
                      alt={listing.volunteer.name || "Volunteer"}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">
                    {listing.volunteer.name}
                  </p>
                </div>
              </div>
            )}

            {/* Organization Info */}
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {listing.cause.organization.name}
              </h2>
              <p className="text-gray-600 mb-4">
                {listing.cause.organization.description}
              </p>
              <div className="flex space-x-4">
                {listing.cause.organization.facebookUrl && (
                  <a
                    href={listing.cause.organization.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-[#E55937]"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
                {listing.cause.organization.instagramUrl && (
                  <a
                    href={listing.cause.organization.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-[#E55937]"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {listing.cause.organization.websiteUrl && (
                  <a
                    href={listing.cause.organization.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-[#E55937]"
                  >
                    <Globe className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>

            {/* Buy Button */}
            {listing.paymentLink && (
              <Button
                asChild
                className="w-full bg-[#E55937] hover:bg-[#E55937]/90"
                size="lg"
              >
                <a href={listing.paymentLink} target="_blank" rel="noopener noreferrer">
                  Buy Now
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 