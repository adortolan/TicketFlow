import Order from '../Order';
import pool from '../../config/database';

jest.mock('../../config/database');

describe('Order model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an order and return insertId', async () => {
      const mockResult = { insertId: 1 };
      (pool.execute as jest.Mock).mockResolvedValue([mockResult]);

      const insertId = await Order.create({
        user_id: 1,
        event_id: 1,
        quantity: 2,
        total_price: 200,
        status: 'PENDING'
      });

      expect(insertId).toBe(1);
      expect(pool.execute).toHaveBeenCalledWith(
        'INSERT INTO orders (user_id, event_id, quantity, total_price, status) VALUES (?, ?, ?, ?, ?)',
        [1, 1, 2, 200, 'PENDING']
      );
    });

    it('should default status to PENDING if not provided', async () => {
      const mockResult = { insertId: 2 };
      (pool.execute as jest.Mock).mockResolvedValue([mockResult]);

      const insertId = await Order.create({
        user_id: 1,
        event_id: 1,
        quantity: 2,
        total_price: 200
      });

      expect(insertId).toBe(2);
      expect(pool.execute).toHaveBeenCalledWith(
        'INSERT INTO orders (user_id, event_id, quantity, total_price, status) VALUES (?, ?, ?, ?, ?)',
        [1, 1, 2, 200, 'PENDING']
      );
    });
  });

  describe('findById', () => {
    it('should return order when found', async () => {
      const mockOrder = {
        id: 1,
        user_id: 1,
        event_id: 1,
        quantity: 2,
        total_price: 200,
        status: 'PENDING' as const,
        created_at: new Date()
      };
      (pool.execute as jest.Mock).mockResolvedValue([[mockOrder]]);

      const order = await Order.findById(1);

      expect(order).toEqual(mockOrder);
      expect(pool.execute).toHaveBeenCalledWith(
        'SELECT * FROM orders WHERE id = ?',
        [1]
      );
    });

    it('should return undefined when not found', async () => {
      (pool.execute as jest.Mock).mockResolvedValue([[]]);

      const order = await Order.findById(999);

      expect(order).toBeUndefined();
    });
  });

  describe('findByUserId', () => {
    it('should return array of orders for user', async () => {
      const mockOrders = [
        {
          id: 1,
          user_id: 1,
          event_id: 1,
          quantity: 2,
          total_price: 200,
          status: 'PENDING' as const,
          created_at: new Date()
        },
        {
          id: 2,
          user_id: 1,
          event_id: 2,
          quantity: 1,
          total_price: 150,
          status: 'COMPLETED' as const,
          created_at: new Date()
        }
      ];
      (pool.execute as jest.Mock).mockResolvedValue([mockOrders]);

      const orders = await Order.findByUserId(1);

      expect(orders).toHaveLength(2);
      expect(pool.execute).toHaveBeenCalledWith(
        'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
        [1]
      );
    });

    it('should return empty array when no orders', async () => {
      (pool.execute as jest.Mock).mockResolvedValue([[]]);

      const orders = await Order.findByUserId(999);

      expect(orders).toEqual([]);
    });
  });

  describe('updateStatus', () => {
    it('should return true when status updated successfully', async () => {
      const mockResult = { affectedRows: 1 };
      (pool.execute as jest.Mock).mockResolvedValue([mockResult]);

      const result = await Order.updateStatus(1, 'COMPLETED');

      expect(result).toBe(true);
      expect(pool.execute).toHaveBeenCalledWith(
        'UPDATE orders SET status = ? WHERE id = ?',
        ['COMPLETED', 1]
      );
    });

    it('should return false when no rows affected', async () => {
      const mockResult = { affectedRows: 0 };
      (pool.execute as jest.Mock).mockResolvedValue([mockResult]);

      const result = await Order.updateStatus(999, 'COMPLETED');

      expect(result).toBe(false);
    });
  });
});
