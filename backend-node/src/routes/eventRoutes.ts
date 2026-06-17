import { Router } from 'express';
import { body, ValidationChain } from 'express-validator';
import { getAllEvents, getEventById, createEvent } from '../controllers/eventController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Validation middleware
const createEventValidation: ValidationChain[] = [
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

export default router;
