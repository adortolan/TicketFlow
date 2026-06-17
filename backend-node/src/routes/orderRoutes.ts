import { Router } from 'express';
import { body, ValidationChain } from 'express-validator';
import { createOrder, getOrderById, getUserOrders } from '../controllers/orderController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Validation middleware
const createOrderValidation: ValidationChain[] = [
  body('event_id').isInt().withMessage('Valid event ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
];

// Routes
router.post('/', authenticateToken, createOrderValidation, createOrder);
router.get('/:id', authenticateToken, getOrderById);
router.get('/user/orders', authenticateToken, getUserOrders);

export default router;
