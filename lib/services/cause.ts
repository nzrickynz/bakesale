import prisma from "@/lib/prisma";
import { Cause, Prisma } from "@prisma/client";

type CauseWithRelations = Cause & {
  listings?: any[];
};

export class CauseService {
  async findMany(params?: {
    where?: Prisma.CauseWhereInput;
    include?: Prisma.CauseInclude;
    orderBy?: Prisma.CauseOrderByWithRelationInput;
  }) {
    return prisma.cause.findMany(params);
  }

  async findUnique(params: {
    where: Prisma.CauseWhereUniqueInput;
    include?: Prisma.CauseInclude;
  }): Promise<CauseWithRelations | null> {
    return prisma.cause.findUnique(params);
  }

  async create(params: {
    data: Prisma.CauseCreateInput;
  }): Promise<Cause> {
    return prisma.cause.create(params);
  }

  async update(
    where: Prisma.CauseWhereUniqueInput,
    data: Prisma.CauseUpdateInput
  ) {
    return prisma.cause.update({ where, data });
  }

  async delete(where: Prisma.CauseWhereUniqueInput) {
    return prisma.cause.delete({ where });
  }

  async findByOrganization(organizationId: string) {
    return prisma.cause.findMany({
      where: { organizationId },
      include: {
        listings: {
          include: {
            volunteer: true,
          },
        },
      },
    });
  }
} 