import { Request, Response, NextFunction } from 'express';
import { getAllEvents, getEventById, createEvent } from '../eventController';
import Event from '../../models/Event';
import { AppError, ErrorCodes } from '../../utils/errors';

// Mock dependencies
jest.mock('../../models/Event');

describe('eventController', () => {
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

  describe('getAllEvents', () => {
    it('should return all events', async () => {
      const mockEvents = [
        { id: 1, name: 'Event 1', date: '2024-01-01', location: 'Location 1', price: 100, available_tickets: 50, created_by: 1 },
        { id: 2, name: 'Event 2', date: '2024-01-02', location: 'Location 2', price: 200, available_tickets: 30, created_by: 1 }
      ];

      (Event.findAll as jest.Mock).mockResolvedValue(mockEvents);

      await getAllEvents(req as Request, res as Response, next);

      expect(res.json).toHaveBeenCalledWith(mockEvents);
      expect(next).not.toHaveBeenCalled();
    });

    it('should pass error to next handler when Event.findAll fails', async () => {
      const mockError = new Error('Database error');
      (Event.findAll as jest.Mock).mockRejectedValue(mockError);

      await getAllEvents(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(mockError);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('getEventById', () => {
    it('should return event when found', async () => {
      const mockEvent = { id: 1, name: 'Event 1', date: '2024-01-01', location: 'Location 1', price: 100, available_tickets: 50, created_by: 1 };
      req.params = { id: '1' };

      (Event.findById as jest.Mock).mockResolvedValue(mockEvent);

      await getEventById(req as Request, res as Response, next);

      expect(res.json).toHaveBeenCalledWith(mockEvent);
      expect(next).not.toHaveBeenCalled();
    });

    it('should throw error when event not found', async () => {
      req.params = { id: '999' };
      (Event.findById as jest.Mock).mockResolvedValue(undefined);

      await getEventById(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 404,
          code: ErrorCodes.EVENT_NOT_FOUND
        })
      );
    });

    it('should pass error to next handler when Event.findById fails', async () => {
      const mockError = new Error('Database error');
      req.params = { id: '1' };
      (Event.findById as jest.Mock).mockRejectedValue(mockError);

      await getEventById(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(mockError);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('createEvent', () => {
    it('should create event successfully with valid data', async () => {
      const mockEventId = 123;
      req.body = {
        name: 'New Event',
        date: '2024-01-01',
        location: 'New Location',
        price: 150,
        available_tickets: 100
      };
      (req as any).user = { id: 1 };

      (Event.create as jest.Mock).mockResolvedValue(mockEventId);

      await createEvent(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Event created successfully',
        eventId: mockEventId
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should pass error to next handler when Event.create fails', async () => {
      const mockError = new Error('Database error');
      req.body = {
        name: 'New Event',
        date: '2024-01-01',
        location: 'New Location',
        price: 150,
        available_tickets: 100
      };
      (req as any).user = { id: 1 };

      (Event.create as jest.Mock).mockRejectedValue(mockError);

      await createEvent(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(mockError);
      expect(res.json).not.toHaveBeenCalled();
    });
  });
});
