import prisma from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import Link from 'next/link';
import { Cause } from '@prisma/client';

export default async function CausesPage() {
  const causes = await prisma.cause.findMany({
    where: {
      status: 'ACTIVE',
    },
    include: {
      organization: {
        select: {
          name: true,
          logoUrl: true,
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-[#F7F6F3] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Active Causes</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {causes.map((cause: Cause & { organization: { name: string; logoUrl: string | null } }) => (
            <Card key={cause.id} className="bg-white">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  {cause.organization.logoUrl && (
                    <div className="relative w-12 h-12 rounded-full overflow-hidden">
                      <Image
                        src={cause.organization.logoUrl}
                        alt={cause.organization.name}
                        fill
                        className="object-cover"
                        priority
                        unoptimized
                      />
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-gray-900">{cause.organization.name}</CardTitle>
                    <p className="text-sm text-gray-900">Organization</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {cause.title}
                </h2>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {cause.description}
                </p>
                <div className="relative h-48 rounded-lg overflow-hidden mb-4">
                  {cause.imageUrl ? (
                    <Image
                      src={cause.imageUrl}
                      alt={cause.title}
                      fill
                      className="object-cover"
                      priority
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                </div>
                <Button
                  asChild
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                >
                  <Link href={`/causes/${cause.id}`}>
                    View Details
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 