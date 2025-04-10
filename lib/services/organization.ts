import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { Organization, UserRole } from "@prisma/client";

export class OrganizationService {
  async findMany(params?: {
    where?: Prisma.OrganizationWhereInput;
    include?: Prisma.OrganizationInclude;
    orderBy?: Prisma.OrganizationOrderByWithRelationInput;
  }) {
    return prisma.organization.findMany(params);
  }

  async findUnique(where: Prisma.OrganizationWhereUniqueInput) {
    return prisma.organization.findUnique({ where });
  }

  async findByName(name: string): Promise<Organization | null> {
    return prisma.organization.findFirst({
      where: { name },
    });
  }

  async findById(id: string): Promise<Organization | null> {
    return prisma.organization.findUnique({
      where: { id },
    });
  }

  async create(data: Prisma.OrganizationCreateInput) {
    return prisma.organization.create({ data });
  }

  async update(
    where: Prisma.OrganizationWhereUniqueInput,
    data: Prisma.OrganizationUpdateInput
  ) {
    return prisma.organization.update({ where, data });
  }

  async delete(where: Prisma.OrganizationWhereUniqueInput) {
    return prisma.organization.delete({ where });
  }

  async findByAdmin(adminId: string) {
    return prisma.organization.findMany({
      where: { adminId },
      include: {
        causes: {
          include: {
            listings: {
              include: {
                volunteer: true,
              },
            },
          },
        },
      },
    });
  }

  async getVolunteers(organizationId: string) {
    return prisma.userOrganization.findMany({
      where: {
        organizationId,
      },
      include: {
        user: true,
      },
    });
  }
} 