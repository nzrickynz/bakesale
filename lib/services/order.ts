import prisma from "@/lib/prisma";
import { Prisma, OrderStatus } from "@prisma/client";

type OrderWithRelations = Prisma.OrderGetPayload<{
  include: {
    listing: {
      include: {
        cause: true;
        volunteer: true;
      };
    };
    creator: true;
  };
}>;

export class OrderService {
  async findMany(params: {
    where?: Prisma.OrderWhereInput;
    include?: Prisma.OrderInclude;
    orderBy?: Prisma.OrderOrderByWithRelationInput;
  }) {
    return prisma.order.findMany(params);
  }

  async findUnique(params: {
    where: Prisma.OrderWhereUniqueInput;
    include?: Prisma.OrderInclude;
  }) {
    return prisma.order.findUnique(params);
  }

  async create(data: Prisma.OrderCreateInput) {
    return prisma.order.create({
      data,
      include: {
        listing: {
          include: {
            cause: true,
            volunteer: true,
          },
        },
        creator: true,
      },
    });
  }

  async update(params: {
    where: Prisma.OrderWhereUniqueInput;
    data: Prisma.OrderUpdateInput;
  }) {
    return prisma.order.update(params);
  }

  async delete(where: Prisma.OrderWhereUniqueInput) {
    return prisma.order.delete({ where });
  }

  async findById(id: string): Promise<OrderWithRelations | null> {
    return prisma.order.findUnique({
      where: { id },
      include: {
        listing: {
          include: {
            cause: true,
            volunteer: true,
          },
        },
        creator: true,
      },
    });
  }

  async updateStatus(id: string, status: OrderStatus) {
    return this.update({
      where: { id },
      data: { fulfillmentStatus: status },
    });
  }

  async getOrdersByVolunteer(volunteerId: string) {
    return this.findMany({
      where: {
        listing: {
          volunteerId,
        },
      },
      include: {
        listing: {
          include: {
            cause: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async getOrdersByCause(causeId: string) {
    return this.findMany({
      where: {
        listing: {
          causeId,
        },
      },
      include: {
        listing: {
          include: {
            volunteer: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async fulfillOrder(id: string, volunteerId: string): Promise<OrderWithRelations> {
    // Find the order with its relations
    const order = await this.findById(id);
    if (!order) {
      throw new Error("Order not found");
    }

    // Check if the volunteer is assigned to the listing
    if (order.listing.volunteerId !== volunteerId) {
      throw new Error("Unauthorized to fulfill this order");
    }

    // Check if the order is already fulfilled
    if (order.fulfillmentStatus === OrderStatus.FULFILLED) {
      throw new Error("Order is already fulfilled");
    }

    // Update the order status to fulfilled
    return prisma.order.update({
      where: { id },
      data: { 
        fulfillmentStatus: OrderStatus.FULFILLED,
      },
      include: {
        listing: {
          include: {
            cause: true,
            volunteer: true,
          },
        },
        creator: true,
      },
    });
  }
} 