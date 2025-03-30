import { prisma } from "@/lib/prisma";
import { CausesClient } from "./causes-client";

export const dynamic = 'force-dynamic'

export default async function CausesPage() {
  // Fetch all active causes with their organizations and listings
  const causes = await prisma.cause.findMany({
    where: {
      status: "ACTIVE",
    },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
          description: true,
          websiteUrl: true,
          facebookUrl: true,
          instagramUrl: true,
        },
      },
      listings: {
        include: {
          volunteer: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return <CausesClient causes={causes} />;
} 