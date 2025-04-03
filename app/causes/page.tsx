import prisma from "@/lib/prisma";
import { CauseCard } from "@/components/causes/cause-card";
import { CausesClient } from "@/components/causes/causes-client";
import { Prisma, Cause, Listing, User } from "@prisma/client";

interface PageProps {
  searchParams: {
    search?: string;
  };
}

export default async function CausesPage({ searchParams }: PageProps) {
  const { search = "" } = searchParams;

  const where: Prisma.CauseWhereInput = {
    status: "ACTIVE",
  };

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const causes = await prisma.cause.findMany({
    where,
    include: {
      listings: {
        include: {
          volunteer: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="container py-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Causes</h1>
          <p className="text-gray-700">
            Browse and support causes from various organizations
          </p>
        </div>

        <CausesClient causes={causes} initialSearch={search} />
      </div>
    </div>
  );
} 