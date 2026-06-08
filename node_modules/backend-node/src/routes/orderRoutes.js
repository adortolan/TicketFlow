const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { createOrder, getOrderById, getUserOrders } = require('../controllers/orderController');
const { authenticateToken } = require('../middleware/auth');

// Validation middleware
const createOrderValidation = [
  body('event_id').isInt().withMessage('Valid event ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
];

// Routes
router.post('/', authenticateToken, createOrderValidation, createOrder);
router.get('/:id', authenticateToken, getOrderById);
router.get('/user/orders', authenticateToken, getUserOrders);

module.exports = router;
