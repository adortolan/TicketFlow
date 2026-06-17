import pool from '../config/database';

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';

export interface IOrder {
  id: number;
  user_id: number;
  event_id: number;
  quantity: number;
  total_price: number;
  status: OrderStatus;
  created_at: Date;
}

export interface IOrderCreate {
  user_id: number;
  event_id: number;
  quantity: number;
  total_price: number;
  status?: OrderStatus;
}

class Order {
  static async create(data: IOrderCreate): Promise<number> {
    const { user_id, event_id, quantity, total_price, status = 'PENDING' } = data;
    const result = await pool.execute(
      'INSERT INTO orders (user_id, event_id, quantity, total_price, status) VALUES (?, ?, ?, ?, ?)',
      [user_id, event_id, quantity, total_price, status]
    );
    const insertResult = result[0] as { insertId: number };
    return insertResult.insertId;
  }

  static async findById(id: number): Promise<IOrder | undefined> {
    const [rows] = await pool.execute(
      'SELECT * FROM orders WHERE id = ?',
      [id]
    );
    const orderRows = rows as IOrder[];
    return orderRows[0];
  }

  static async findByUserId(user_id: number): Promise<IOrder[]> {
    const [rows] = await pool.execute(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [user_id]
    );
    return rows as IOrder[];
  }

  static async updateStatus(id: number, status: OrderStatus): Promise<boolean> {
    const result = await pool.execute(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, id]
    );
    const updateResult = result[0] as { affectedRows: number };
    return updateResult.affectedRows > 0;
  }
}

export default Order;
