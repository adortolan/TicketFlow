import Event from '../Event';
import pool from '../../config/database';

jest.mock('../../config/database');

describe('Event model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an event and return insertId', async () => {
      const mockResult = { insertId: 1 };
      (pool.execute as jest.Mock).mockResolvedValue([mockResult]);

      const insertId = await Event.create({
        name: 'Test Event',
        date: '2024-12-31',
        location: 'Test Location',
        price: 100,
        available_tickets: 100,
        created_by: 1
      });

      expect(insertId).toBe(1);
      expect(pool.execute).toHaveBeenCalledWith(
        'INSERT INTO events (name, date, location, price, available_tickets, created_by) VALUES (?, ?, ?, ?, ?, ?)',
        ['Test Event', '2024-12-31', 'Test Location', 100, 100, 1]
      );
    });
  });

  describe('findAll', () => {
    it('should return array of events', async () => {
      const mockEvents = [
        {
          id: 1,
          name: 'Event 1',
          date: new Date('2024-12-31'),
          location: 'Location 1',
          price: 100,
          available_tickets: 50,
          created_by: 1
        },
        {
          id: 2,
          name: 'Event 2',
          date: new Date('2025-01-15'),
          location: 'Location 2',
          price: 200,
          available_tickets: 30,
          created_by: 1
        }
      ];
      (pool.execute as jest.Mock).mockResolvedValue([mockEvents]);

      const events = await Event.findAll();

      expect(events).toHaveLength(2);
      expect(pool.execute).toHaveBeenCalledWith(
        'SELECT * FROM events WHERE available_tickets > 0 ORDER BY date ASC'
      );
    });

    it('should return empty array when no events', async () => {
      (pool.execute as jest.Mock).mockResolvedValue([[]]);

      const events = await Event.findAll();

      expect(events).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return event when found', async () => {
      const mockEvent = {
        id: 1,
        name: 'Test Event',
        date: new Date('2024-12-31'),
        location: 'Test Location',
        price: 100,
        available_tickets: 50,
        created_by: 1
      };
      (pool.execute as jest.Mock).mockResolvedValue([[mockEvent]]);

      const event = await Event.findById(1);

      expect(event).toEqual(mockEvent);
      expect(pool.execute).toHaveBeenCalledWith(
        'SELECT * FROM events WHERE id = ?',
        [1]
      );
    });

    it('should return undefined when not found', async () => {
      (pool.execute as jest.Mock).mockResolvedValue([[]]);

      const event = await Event.findById(999);

      expect(event).toBeUndefined();
    });
  });

  describe('updateAvailableTickets', () => {
    it('should return true when tickets updated successfully', async () => {
      const mockResult = { affectedRows: 1 };
      (pool.execute as jest.Mock).mockResolvedValue([mockResult]);

      const result = await Event.updateAvailableTickets(1, 2);

      expect(result).toBe(true);
      expect(pool.execute).toHaveBeenCalledWith(
        'UPDATE events SET available_tickets = available_tickets - ? WHERE id = ? AND available_tickets >= ?',
        [2, 1, 2]
      );
    });

    it('should return false when no rows affected', async () => {
      const mockResult = { affectedRows: 0 };
      (pool.execute as jest.Mock).mockResolvedValue([mockResult]);

      const result = await Event.updateAvailableTickets(1, 2);

      expect(result).toBe(false);
    });
  });
});
