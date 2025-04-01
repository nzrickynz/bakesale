import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export class ListingService {
  async findMany(params?: {
    where?: Prisma.ListingWhereInput;
    include?: Prisma.ListingInclude;
    orderBy?: Prisma.ListingOrderByWithRelationInput;
  }) {
    return prisma.listing.findMany(params);
  }

  async findUnique(where: Prisma.ListingWhereUniqueInput) {
    return prisma.listing.findUnique({ where });
  }

  async create(data: Prisma.ListingCreateInput) {
    return prisma.listing.create({ data });
  }

  async update(
    where: Prisma.ListingWhereUniqueInput,
    data: Prisma.ListingUpdateInput
  ) {
    return prisma.listing.update({ where, data });
  }

  async delete(where: Prisma.ListingWhereUniqueInput) {
    return prisma.listing.delete({ where });
  }

  async findByCause(causeId: string) {
    return prisma.listing.findMany({
      where: { causeId },
      include: {
        volunteer: true,
      },
    });
  }

  async findByVolunteer(volunteerId: string) {
    return prisma.listing.findMany({
      where: { volunteerId },
      include: {
        cause: true,
      },
    });
  }
} 