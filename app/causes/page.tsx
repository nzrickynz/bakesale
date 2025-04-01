import prisma from "@/lib/prisma";
import { CauseCard } from "@/components/causes/cause-card";
import { SearchFilter } from "@/components/causes/search-filter";
import { Prisma, CauseCategory, Cause, Listing, User } from "@prisma/client";

interface PageProps {
  searchParams: {
    search?: string;
    category?: CauseCategory | "ALL";
  };
}

export default async function CausesPage({ searchParams }: PageProps) {
  const { search = "", category = "ALL" } = searchParams;

  const where: Prisma.CauseWhereInput = {
    status: "ACTIVE",
  };

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  if (category !== "ALL") {
    where.category = category;
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
          <h1 className="text-3xl font-bold">Causes</h1>
          <p className="text-muted-foreground">
            Browse and support causes from various organizations
          </p>
        </div>

        <SearchFilter
          search={search}
          onSearchChange={() => {}}
          category={category}
          onCategoryChange={() => {}}
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {causes?.map((cause: Cause & { listings: (Listing & { volunteer: User })[] }) => (
            <CauseCard key={cause.id} cause={cause} />
          ))}
        </div>
      </div>
    </div>
  );
} 