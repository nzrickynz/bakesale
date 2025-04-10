import { OrderService } from '@/lib/services/order';
import { PrismaClient, OrderStatus } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}));

import prisma from '@/lib/prisma';

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

describe('OrderService', () => {
  let orderService: OrderService;

  beforeEach(() => {
    mockReset(prismaMock);
    orderService = new OrderService();
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

      (prismaMock.order.create as jest.Mock).mockResolvedValue(mockOrder);

      const result = await orderService.create({
        buyerEmail: 'test@example.com',
        listing: { connect: { id: 'listing-1' } },
        creator: { connect: { id: 'user-1' } },
      });

      expect(result).toEqual(mockOrder);
      expect(prismaMock.order.create).toHaveBeenCalled();
    });
  });

  describe('updateStatus', () => {
    it('should update order status', async () => {
      const mockOrder = {
        id: '1',
        buyerEmail: 'test@example.com',
        fulfillmentStatus: OrderStatus.ORDERED,
        createdAt: new Date(),
        updatedAt: new Date(),
        listingId: '1',
        creatorId: '1',
      };

      prismaMock.order.update.mockResolvedValue(mockOrder);

      const result = await orderService.updateStatus('1', OrderStatus.FULFILLED);

      expect(prismaMock.order.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { fulfillmentStatus: OrderStatus.FULFILLED },
      });
      expect(result).toEqual(mockOrder);
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

      (prismaMock.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);
      (prismaMock.order.update as jest.Mock).mockResolvedValue({
        ...mockOrder,
        fulfillmentStatus: OrderStatus.FULFILLED,
      });

      const result = await orderService.fulfillOrder('1', 'volunteer-1');

      expect(result.fulfillmentStatus).toBe(OrderStatus.FULFILLED);
      expect(prismaMock.order.update).toHaveBeenCalled();
    });

    it('should throw error if volunteer is not authorized', async () => {
      const mockOrder = {
        id: '1',
        listing: {
          volunteerId: 'volunteer-1',
        },
      };

      (prismaMock.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);

      await expect(
        orderService.fulfillOrder('1', 'unauthorized-volunteer')
      ).rejects.toThrow('Unauthorized to fulfill this order');
    });
  });
}); 