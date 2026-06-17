import pool from '../config/database';

export interface IEvent {
  id: number;
  name: string;
  date: Date;
  location: string;
  price: number;
  available_tickets: number;
  created_by: number;
}

export interface IEventCreate {
  name: string;
  date: string;
  location: string;
  price: number;
  available_tickets: number;
  created_by: number;
}

class Event {
  static async create(data: IEventCreate): Promise<number> {
    const { name, date, location, price, available_tickets, created_by } = data;
    const result = await pool.execute(
      'INSERT INTO events (name, date, location, price, available_tickets, created_by) VALUES (?, ?, ?, ?, ?, ?)',
      [name, date, location, price, available_tickets, created_by]
    );
    const insertResult = result[0] as { insertId: number };
    return insertResult.insertId;
  }

  static async findAll(): Promise<IEvent[]> {
    const [rows] = await pool.execute(
      'SELECT * FROM events WHERE available_tickets > 0 ORDER BY date ASC'
    );
    return rows as IEvent[];
  }

  static async findById(id: number): Promise<IEvent | undefined> {
    const [rows] = await pool.execute(
      'SELECT * FROM events WHERE id = ?',
      [id]
    );
    const eventRows = rows as IEvent[];
    return eventRows[0];
  }

  static async updateAvailableTickets(id: number, quantity: number): Promise<boolean> {
    const result = await pool.execute(
      'UPDATE events SET available_tickets = available_tickets - ? WHERE id = ? AND available_tickets >= ?',
      [quantity, id, quantity]
    );
    const updateResult = result[0] as { affectedRows: number };
    return updateResult.affectedRows > 0;
  }
}

export default Event;
