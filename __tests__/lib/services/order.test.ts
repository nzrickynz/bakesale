import { OrderService } from '@/lib/services/order';
import { OrderStatus } from '@prisma/client';
import prisma from '@/lib/prisma';

// Mock Prisma client
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    order: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
    cause: {
      findUnique: jest.fn(),
    },
  })),
  OrderStatus: {
    PENDING: 'PENDING',
    PAID: 'PAID',
    CANCELLED: 'CANCELLED',
  },
}));

jest.mock('@/lib/prisma');

describe('OrderService', () => {
  let orderService: OrderService;

  beforeEach(() => {
    orderService = new OrderService();
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an order with correct data', async () => {
      const mockOrder = {
        id: '1',
        buyerEmail: 'test@example.com',
        listingId: 'listing-1',
        creatorId: 'user-1',
        fulfillmentStatus: OrderStatus.ORDERED,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.order.create as jest.Mock).mockResolvedValue(mockOrder);

      const result = await orderService.create({
        buyerEmail: 'test@example.com',
        listing: { connect: { id: 'listing-1' } },
        creator: { connect: { id: 'user-1' } },
      });

      expect(result).toEqual(mockOrder);
      expect(prisma.order.create).toHaveBeenCalled();
    });
  });

  describe('updateStatus', () => {
    it('should update order status', async () => {
      const mockOrder = {
        id: '1',
        fulfillmentStatus: OrderStatus.IN_PROGRESS,
      };

      (prisma.order.update as jest.Mock).mockResolvedValue(mockOrder);

      const result = await orderService.updateStatus('1', OrderStatus.IN_PROGRESS);

      expect(result).toEqual(mockOrder);
      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { fulfillmentStatus: OrderStatus.IN_PROGRESS },
      });
    });
  });

  describe('fulfillOrder', () => {
    it('should fulfill an order if volunteer is authorized', async () => {
      const mockOrder = {
        id: '1',
        listing: {
          volunteerId: 'volunteer-1',
        },
        fulfillmentStatus: OrderStatus.ORDERED,
      };

      (prisma.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);
      (prisma.order.update as jest.Mock).mockResolvedValue({
        ...mockOrder,
        fulfillmentStatus: OrderStatus.FULFILLED,
      });

      const result = await orderService.fulfillOrder('1', 'volunteer-1');

      expect(result.fulfillmentStatus).toBe(OrderStatus.FULFILLED);
      expect(prisma.order.update).toHaveBeenCalled();
    });

    it('should throw error if volunteer is not authorized', async () => {
      const mockOrder = {
        id: '1',
        listing: {
          volunteerId: 'volunteer-1',
        },
      };

      (prisma.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);

      await expect(
        orderService.fulfillOrder('1', 'unauthorized-volunteer')
      ).rejects.toThrow('Unauthorized to fulfill this order');
    });
  });
}); 