import prisma from "@/lib/prisma";
import { Prisma, UserRole, User, UserOrganization, Organization } from "@prisma/client";
import { hash } from "bcryptjs";

type UserWithRelations = User & {
  userOrganizations?: (UserOrganization & {
    organization: Organization;
  })[];
};

type TeamMember = UserOrganization & {
  user: {
    id: string;
    name: string | null;
    email: string;
  };
};

type CreateWithOrganizationInput = {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  organization: {
    name: string;
    description: string;
    websiteUrl?: string | null;
    facebookUrl?: string | null;
    instagramUrl?: string | null;
    logoUrl?: string | null;
  };
};

export class UserService {
  async findMany(params?: {
    where?: Prisma.UserWhereInput;
    include?: Prisma.UserInclude;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }) {
    return prisma.user.findMany(params);
  }

  async findUnique(params: {
    where: Prisma.UserWhereUniqueInput;
    include?: Prisma.UserInclude;
  }): Promise<UserWithRelations | null> {
    return prisma.user.findUnique(params);
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async create(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data });
  }

  async update(
    where: Prisma.UserWhereUniqueInput,
    data: Prisma.UserUpdateInput
  ) {
    return prisma.user.update({ where, data });
  }

  async delete(where: Prisma.UserWhereUniqueInput) {
    return prisma.user.delete({ where });
  }

  async findByRole(role: UserRole) {
    return prisma.user.findMany({
      where: { role },
      include: {
        userOrganizations: {
          include: {
            organization: true,
          },
        },
      },
    });
  }

  async findByOrganization(organizationId: string) {
    return prisma.user.findMany({
      where: {
        userOrganizations: {
          some: {
            organizationId,
          },
        },
      },
      include: {
        userOrganizations: {
          where: {
            organizationId,
          },
        },
      },
    });
  }

  async addTeamMember(params: {
    userId: string;
    organizationId: string;
    role: UserRole;
  }): Promise<TeamMember> {
    return prisma.userOrganization.create({
      data: {
        userId: params.userId,
        organizationId: params.organizationId,
        role: params.role,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async getTeamMembers(organizationId: string): Promise<TeamMember[]> {
    return prisma.userOrganization.findMany({
      where: { organizationId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async hasAdminAccess(userId: string, organizationId: string): Promise<boolean> {
    const userOrg = await prisma.userOrganization.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
    });

    return userOrg ? ["ORG_ADMIN", "SUPER_ADMIN"].includes(userOrg.role) : false;
  }

  async isTeamMember(userId: string, organizationId: string): Promise<boolean> {
    const userOrg = await prisma.userOrganization.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
    });

    return !!userOrg;
  }

  async createWithOrganization(input: CreateWithOrganizationInput): Promise<{
    user: User;
    organization: Organization;
  }> {
    const { email, password, name, role, organization } = input;

    // Hash password
    const passwordHash = await hash(password, 12);

    // Use a transaction to ensure all database operations succeed or fail together
    return prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email,
          name,
          passwordHash,
          role,
        },
      });

      // Create organization
      const org = await tx.organization.create({
        data: {
          name: organization.name,
          description: organization.description,
          websiteUrl: organization.websiteUrl,
          facebookUrl: organization.facebookUrl,
          instagramUrl: organization.instagramUrl,
          logoUrl: organization.logoUrl,
          adminId: user.id,
        },
      });

      // Create user-organization relationship
      await tx.userOrganization.create({
        data: {
          userId: user.id,
          organizationId: org.id,
          role,
        },
      });

      return { user, organization: org };
    });
  }

  async getOrganizationVolunteers(organizationId: string) {
    return prisma.userOrganization.findMany({
      where: {
        organizationId,
        role: "VOLUNTEER",
      },
      include: {
        user: true,
      },
    });
  }

  async hasOrganizationAccess(userId: string, organizationId: string, requiredRoles: UserRole[] = ["ORG_ADMIN", "SUPER_ADMIN"]) {
    const userOrg = await prisma.userOrganization.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
    });

    if (!userOrg) {
      return false;
    }

    return requiredRoles.includes(userOrg.role);
  }

  async updateUserOrganizationRole(
    userId: string,
    organizationId: string,
    newRole: UserRole
  ) {
    return prisma.userOrganization.update({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
      data: {
        role: newRole,
      },
    });
  }

  async removeUserFromOrganization(userId: string, organizationId: string) {
    return prisma.userOrganization.delete({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
    });
  }

  async updateTeamMemberAssignments(
    userId: string,
    organizationId: string,
    assignments: { id: string; type: string }[]
  ) {
    const listingIds = assignments
      .filter(a => a.type === "listing")
      .map(a => a.id);

    const organizationIds = assignments
      .filter(a => a.type === "organization")
      .map(a => a.id);

    // First, get the UserOrganization record
    const userOrg = await prisma.userOrganization.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
    });

    if (!userOrg) {
      throw new Error("Team member not found");
    }

    // Then update the assignments
    return prisma.userOrganization.update({
      where: {
        id: userOrg.id,
      },
      data: {
        assignedListings: {
          set: listingIds.map(id => ({ id })),
        },
        assignedOrganizations: {
          set: organizationIds.map(id => ({ id })),
        },
      },
      include: {
        assignedListings: true,
        assignedOrganizations: true,
      },
    });
  }
} 