const Event = require('../models/Event');
const { authenticateToken, requireRole } = require('../middleware/auth');

const getAllEvents = async (req, res) => {
  try {
    const events = await Event.findAll();
    res.json(events);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createEvent = async (req, res) => {
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
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent
};
