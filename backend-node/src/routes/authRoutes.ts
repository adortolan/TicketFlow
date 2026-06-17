import { Router, Request, Response, NextFunction } from 'express';
import { body, ValidationChain } from 'express-validator';
import { register, login, getProfile } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Validation middleware
const registerValidation: ValidationChain[] = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('cpf').notEmpty().withMessage('CPF is required')
];

const loginValidation: ValidationChain[] = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

// Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/profile', authenticateToken, getProfile);

export default router;
