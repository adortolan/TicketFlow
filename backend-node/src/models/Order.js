const pool = require('../config/database');

class Order {
  static async create({ user_id, event_id, quantity, total_price, status = 'PENDING' }) {
    const [result] = await pool.execute(
      'INSERT INTO orders (user_id, event_id, quantity, total_price, status) VALUES (?, ?, ?, ?, ?)',
      [user_id, event_id, quantity, total_price, status]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM orders WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async findByUserId(user_id) {
    const [rows] = await pool.execute(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [user_id]
    );
    return rows;
  }

  static async updateStatus(id, status) {
    const [result] = await pool.execute(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Order;
