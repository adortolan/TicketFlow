const pool = require('../config/database');

class Event {
  static async create({ name, date, location, price, available_tickets, created_by }) {
    const [result] = await pool.execute(
      'INSERT INTO events (name, date, location, price, available_tickets, created_by) VALUES (?, ?, ?, ?, ?, ?)',
      [name, date, location, price, available_tickets, created_by]
    );
    return result.insertId;
  }

  static async findAll() {
    const [rows] = await pool.execute(
      'SELECT * FROM events WHERE available_tickets > 0 ORDER BY date ASC'
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM events WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async updateAvailableTickets(id, quantity) {
    const [result] = await pool.execute(
      'UPDATE events SET available_tickets = available_tickets - ? WHERE id = ? AND available_tickets >= ?',
      [quantity, id, quantity]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Event;
