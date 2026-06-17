import { Request, Response, NextFunction } from 'express';
import Event from '../models/Event';
import { authenticateToken, requireRole } from '../middleware/auth';
import { AppError, ErrorCodes } from '../utils/errors';

export const getAllEvents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const events = await Event.findAll();
    res.json(events);
  } catch (error) {
    console.error('Get events error:', error);
    next(error); // Pass to global error handler
  }
};

export const getEventById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const eventId = parseInt(req.params.id as string, 10);
    const event = await Event.findById(eventId);
    if (!event) {
      throw new AppError('Event not found', 404, ErrorCodes.EVENT_NOT_FOUND);
    }
    res.json(event);
  } catch (error) {
    console.error('Get event error:', error);
    next(error); // Pass to global error handler
  }
};

export const createEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, date, location, price, available_tickets } = req.body;

    const eventId = await Event.create({
      name,
      date,
      location,
      price,
      available_tickets,
      created_by: req.user!.id
    });

    res.status(201).json({
      message: 'Event created successfully',
      eventId
    });
  } catch (error) {
    console.error('Create event error:', error);
    next(error); // Pass to global error handler
  }
};
