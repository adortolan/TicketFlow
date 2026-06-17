import { Request, Response, NextFunction } from 'express';
import { createOrder, getOrderById, getUserOrders } from '../orderController';
import Order from '../../models/Order';
import Event from '../../models/Event';
import { AppError, ErrorCodes } from '../../utils/errors';
import { getChannel } from '../../config/rabbitmq';

// Mock dependencies
jest.mock('../../models/Order');
jest.mock('../../models/Event');
jest.mock('../../config/rabbitmq');

describe('orderController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should create order successfully when event exists and has enough tickets', async () => {
      const mockOrderId = 456;
      const mockEvent = {
        id: 1,
        name: 'Event 1',
        price: 100,
        available_tickets: 50
      };

      req.body = {
        eventId: 1,
        quantity: 2
      };
      (req as any).user = { id: 1, role: 'CLIENTE' };

      (Event.findById as jest.Mock).mockResolvedValue(mockEvent);
      (Order.create as jest.Mock).mockResolvedValue(mockOrderId);
      (getChannel as jest.Mock).mockReturnValue({
        sendToQueue: jest.fn().mockResolvedValue(undefined)
      });

      await createOrder(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(202);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Order created and is being processed',
        orderId: mockOrderId,
        status: 'PROCESSING'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should throw error when event not found', async () => {
      req.body = {
        eventId: 999,
        quantity: 2
      };
      (req as any).user = { id: 1, role: 'CLIENTE' };

      (Event.findById as jest.Mock).mockResolvedValue(undefined);

      await createOrder(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 404,
          code: ErrorCodes.EVENT_NOT_FOUND
        })
      );
    });

    it('should throw error when not enough tickets available', async () => {
      const mockEvent = {
        id: 1,
        name: 'Event 1',
        price: 100,
        available_tickets: 5
      };

      req.body = {
        eventId: 1,
        quantity: 10
      };
      (req as any).user = { id: 1, role: 'CLIENTE' };

      (Event.findById as jest.Mock).mockResolvedValue(mockEvent);

      await createOrder(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          code: ErrorCodes.INVALID_INPUT
        })
      );
    });

    it('should continue with order creation even if RabbitMQ publish fails', async () => {
      const mockOrderId = 456;
      const mockEvent = {
        id: 1,
        name: 'Event 1',
        price: 100,
        available_tickets: 50
      };

      req.body = {
        eventId: 1,
        quantity: 2
      };
      (req as any).user = { id: 1, role: 'CLIENTE' };

      (Event.findById as jest.Mock).mockResolvedValue(mockEvent);
      (Order.create as jest.Mock).mockResolvedValue(mockOrderId);
      (getChannel as jest.Mock).mockReturnValue({
        sendToQueue: jest.fn().mockRejectedValue(new Error('RabbitMQ error'))
      });

      await createOrder(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(202);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Order created and is being processed',
        orderId: mockOrderId,
        status: 'PROCESSING'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('getOrderById', () => {
    it('should return order when user owns it', async () => {
      const mockOrder = {
        id: 1,
        user_id: 1,
        event_id: 1,
        quantity: 2,
        total_price: 200,
        status: 'COMPLETED'
      };

      req.params = { id: '1' };
      (req as any).user = { id: 1, role: 'CLIENTE' };

      (Order.findById as jest.Mock).mockResolvedValue(mockOrder);

      await getOrderById(req as Request, res as Response, next);

      expect(res.json).toHaveBeenCalledWith(mockOrder);
      expect(next).not.toHaveBeenCalled();
    });

    it('should return order when user is admin', async () => {
      const mockOrder = {
        id: 1,
        user_id: 2,
        event_id: 1,
        quantity: 2,
        total_price: 200,
        status: 'COMPLETED'
      };

      req.params = { id: '1' };
      (req as any).user = { id: 1, role: 'ADMIN' };

      (Order.findById as jest.Mock).mockResolvedValue(mockOrder);

      await getOrderById(req as Request, res as Response, next);

      expect(res.json).toHaveBeenCalledWith(mockOrder);
      expect(next).not.toHaveBeenCalled();
    });

    it('should throw error when order not found', async () => {
      req.params = { id: '999' };
      (req as any).user = { id: 1, role: 'CLIENTE' };

      (Order.findById as jest.Mock).mockResolvedValue(undefined);

      await getOrderById(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 404,
          code: ErrorCodes.ORDER_NOT_FOUND
        })
      );
    });

    it('should throw error when user does not own the order and is not admin', async () => {
      const mockOrder = {
        id: 1,
        user_id: 2,
        event_id: 1,
        quantity: 2,
        total_price: 200,
        status: 'COMPLETED'
      };

      req.params = { id: '1' };
      (req as any).user = { id: 1, role: 'CLIENTE' };

      (Order.findById as jest.Mock).mockResolvedValue(mockOrder);

      await getOrderById(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403,
          code: ErrorCodes.INSUFFICIENT_PERMISSIONS
        })
      );
    });
  });

  describe('getUserOrders', () => {
    it('should return user orders', async () => {
      const mockOrders = [
        { id: 1, user_id: 1, event_id: 1, quantity: 2, total_price: 200, status: 'COMPLETED' },
        { id: 2, user_id: 1, event_id: 2, quantity: 1, total_price: 150, status: 'PENDING' }
      ];

      (req as any).user = { id: 1, role: 'CLIENTE' };
      (Order.findByUserId as jest.Mock).mockResolvedValue(mockOrders);

      await getUserOrders(req as Request, res as Response, next);

      expect(res.json).toHaveBeenCalledWith(mockOrders);
      expect(next).not.toHaveBeenCalled();
    });

    it('should pass error to next handler when Order.findByUserId fails', async () => {
      const mockError = new Error('Database error');
      (req as any).user = { id: 1, role: 'CLIENTE' };
      (Order.findByUserId as jest.Mock).mockRejectedValue(mockError);

      await getUserOrders(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(mockError);
      expect(res.json).not.toHaveBeenCalled();
    });
  });
});
