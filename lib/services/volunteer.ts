import prisma from "@/lib/prisma";
import { Prisma, UserRole } from "@prisma/client";
import { hash } from "bcryptjs";

type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    managedListings: {
      include: {
        cause: true;
        orders: true;
      };
    };
    userOrganizations: {
      include: {
        organization: true;
      };
    };
  };
}>;

export class VolunteerService {
  async findMany(params: {
    where?: Prisma.UserWhereInput;
    include?: Prisma.UserInclude;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }) {
    return prisma.user.findMany({
      ...params,
      where: {
        ...params.where,
        role: UserRole.VOLUNTEER,
      },
    });
  }

  async findUnique(params: {
    where: Prisma.UserWhereUniqueInput;
    include?: Prisma.UserInclude;
  }) {
    return prisma.user.findUnique({
      ...params,
      where: {
        ...params.where,
        role: UserRole.VOLUNTEER,
      },
    });
  }

  async create(params: {
    data: Prisma.UserCreateInput;
    include?: Prisma.UserInclude;
  }) {
    return prisma.user.create({
      ...params,
      data: {
        ...params.data,
        role: UserRole.VOLUNTEER,
      },
    });
  }

  async update(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }) {
    return prisma.user.update(params);
  }

  async delete(where: Prisma.UserWhereUniqueInput) {
    return prisma.user.delete({ where });
  }

  async findAssignedListings(userId: string) {
    return prisma.listing.findMany({
      where: {
        volunteerId: userId,
      },
      include: {
        cause: true,
        orders: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async getProfile(userId: string): Promise<UserWithRelations | null> {
    return prisma.user.findUnique({
      where: { 
        id: userId,
        role: UserRole.VOLUNTEER,
      },
      include: {
        managedListings: {
          include: {
            cause: true,
            orders: true,
          },
        },
        userOrganizations: {
          include: {
            organization: true,
          },
        },
      },
    });
  }

  async createVolunteer(data: {
    email: string;
    name: string;
    password: string;
    organizationId: string;
  }) {
    // Hash the password
    const passwordHash = await hash(data.password, 12);

    // Create the user as a volunteer
    const user = await this.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash,
      },
    });

    // Add the user to the organization
    await prisma.userOrganization.create({
      data: {
        user: {
          connect: { id: user.id }
        },
        organization: {
          connect: { id: data.organizationId }
        },
        role: UserRole.VOLUNTEER,
      },
    });

    return user;
  }

  async getVolunteersByOrganization(organizationId: string) {
    return prisma.userOrganization.findMany({
      where: {
        organizationId,
        role: UserRole.VOLUNTEER,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });
  }
} 