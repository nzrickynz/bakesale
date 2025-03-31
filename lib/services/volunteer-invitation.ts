import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export class VolunteerInvitationService {
  async findMany(params: {
    where?: Prisma.VolunteerInvitationWhereInput;
    include?: Prisma.VolunteerInvitationInclude;
    orderBy?: Prisma.VolunteerInvitationOrderByWithRelationInput;
  }) {
    return prisma.volunteerInvitation.findMany(params);
  }

  async findUnique(params: {
    where: Prisma.VolunteerInvitationWhereUniqueInput;
    include?: Prisma.VolunteerInvitationInclude;
  }) {
    return prisma.volunteerInvitation.findUnique(params);
  }

  async create(data: Prisma.VolunteerInvitationCreateInput) {
    return prisma.volunteerInvitation.create({
      data,
      include: {
        invitedBy: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  async update(params: {
    where: Prisma.VolunteerInvitationWhereUniqueInput;
    data: Prisma.VolunteerInvitationUpdateInput;
  }) {
    return prisma.volunteerInvitation.update(params);
  }

  async delete(where: Prisma.VolunteerInvitationWhereUniqueInput) {
    return prisma.volunteerInvitation.delete({ where });
  }

  async findByOrganization(organizationId: string) {
    return this.findMany({
      where: {
        organizationId,
      },
      include: {
        invitedBy: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  async findByEmail(email: string, organizationId: string) {
    return this.findUnique({
      where: {
        email_organizationId: {
          email,
          organizationId,
        },
      },
    });
  }
} 