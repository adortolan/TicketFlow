const Event = require('../models/Event');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { AppError, ErrorCodes } = require('../utils/errors');

const getAllEvents = async (req, res, next) => {
  try {
    const events = await Event.findAll();
    res.json(events);
  } catch (error) {
    console.error('Get events error:', error);
    next(error); // Pass to global error handler
  }
};

const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      throw new AppError('Event not found', 404, ErrorCodes.EVENT_NOT_FOUND);
    }
    res.json(event);
  } catch (error) {
    console.error('Get event error:', error);
    next(error); // Pass to global error handler
  }
};

const createEvent = async (req, res, next) => {
  try {
    const { name, date, location, price, available_tickets } = req.body;

    const eventId = await Event.create({
      name,
      date,
      location,
      price,
      available_tickets,
      created_by: req.user.id
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

module.exports = {
  getAllEvents,
  getEventById,
  createEvent
};
