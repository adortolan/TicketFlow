const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { getAllEvents, getEventById, createEvent } = require('../controllers/eventController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Validation middleware
const createEventValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('location').notEmpty().withMessage('Location is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be positive'),
  body('available_tickets').isInt({ min: 1 }).withMessage('Available tickets must be at least 1')
];

// Routes
router.get('/', getAllEvents);
router.get('/:id', getEventById);
router.post('/', authenticateToken, requireRole('ADMIN'), createEventValidation, createEvent);

module.exports = router;
