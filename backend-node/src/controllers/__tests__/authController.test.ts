import { Request, Response, NextFunction } from 'express';
import { register, login, getProfile } from '../authController';
import User from '../../models/User';
import { AppError, ErrorCodes } from '../../utils/errors';
import { getChannel } from '../../config/rabbitmq';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Mock dependencies
jest.mock('../../models/User');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../../config/rabbitmq');

describe('authController', () => {
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

  describe('register', () => {
    it('should register user successfully with valid data', async () => {
      const mockUserId = 123;
      req.body = {
        nome: 'Test User',
        email: 'test@test.com',
        senha: 'password123',
        cpf: '12345678901'
      };

      (User.findByEmail as jest.Mock).mockResolvedValue(undefined);
      (User.findByCpf as jest.Mock).mockResolvedValue(undefined);
      (User.create as jest.Mock).mockResolvedValue(mockUserId);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      (getChannel as jest.Mock).mockReturnValue({
        sendToQueue: jest.fn().mockResolvedValue(undefined)
      });

      await register(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User registered successfully',
        userId: mockUserId
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should throw error when email already registered', async () => {
      req.body = {
        nome: 'Test User',
        email: 'test@test.com',
        senha: 'password123',
        cpf: '12345678901'
      };

      (User.findByEmail as jest.Mock).mockResolvedValue({ id: 1, email: 'test@test.com' });

      await register(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 409,
          code: ErrorCodes.EMAIL_ALREADY_REGISTERED
        })
      );
    });

    it('should throw error when CPF already registered', async () => {
      req.body = {
        nome: 'Test User',
        email: 'test@test.com',
        senha: 'password123',
        cpf: '12345678901'
      };

      (User.findByEmail as jest.Mock).mockResolvedValue(undefined);
      (User.findByCpf as jest.Mock).mockResolvedValue({ id: 1, cpf: '12345678901' });

      await register(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 409,
          code: ErrorCodes.CPF_ALREADY_REGISTERED
        })
      );
    });

    it('should throw error when missing required fields', async () => {
      req.body = {
        nome: 'Test User',
        email: 'test@test.com',
        senha: 'password123'
        // cpf missing
      };

      await register(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          code: ErrorCodes.MISSING_FIELDS
        })
      );
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        password: 'hashedPassword',
        role: 'CLIENTE',
        name: 'Test User'
      };

      req.body = {
        email: 'test@test.com',
        senha: 'password123'
      };

      (User.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('mock-jwt-token');

      await login(req as Request, res as Response, next);

      expect(res.json).toHaveBeenCalledWith({
        token: 'mock-jwt-token',
        user: {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role
        }
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should throw error when user not found', async () => {
      req.body = {
        email: 'test@test.com',
        senha: 'password123'
      };

      (User.findByEmail as jest.Mock).mockResolvedValue(undefined);

      await login(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          code: ErrorCodes.INVALID_CREDENTIALS
        })
      );
    });

    it('should throw error when password is incorrect', async () => {
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        password: 'hashedPassword',
        role: 'CLIENTE',
        name: 'Test User'
      };

      req.body = {
        email: 'test@test.com',
        senha: 'wrongpassword'
      };

      (User.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await login(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          code: ErrorCodes.INVALID_CREDENTIALS
        })
      );
    });
  });

  describe('getProfile', () => {
    it('should return user profile when user exists', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@test.com',
        role: 'CLIENTE'
      };

      (req as any).user = { id: 1, email: 'test@test.com', role: 'CLIENTE' };

      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      await getProfile(req as Request, res as Response, next);

      expect(res.json).toHaveBeenCalledWith(mockUser);
      expect(next).not.toHaveBeenCalled();
    });

    it('should throw error when user not found', async () => {
      (req as any).user = { id: 999, email: 'test@test.com', role: 'CLIENTE' };

      (User.findById as jest.Mock).mockResolvedValue(undefined);

      await getProfile(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 404,
          code: ErrorCodes.USER_NOT_FOUND
        })
      );
    });
  });
});
