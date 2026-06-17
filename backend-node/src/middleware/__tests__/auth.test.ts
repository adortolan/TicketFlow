import jwt from 'jsonwebtoken';
import { authenticateToken, requireRole } from '../auth';
import { AppError, ErrorCodes } from '../../utils/errors';
import { JWTPayload } from '../../types';

jest.mock('jsonwebtoken');

describe('Auth middleware', () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {
      headers: {},
      user: undefined
    };
    mockRes = {};
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('authenticateToken', () => {
    it('should throw TOKEN_REQUIRED error when Authorization header is missing', () => {
      expect(() => {
        authenticateToken(mockReq, mockRes, mockNext);
      }).toThrow(AppError);

      try {
        authenticateToken(mockReq, mockRes, mockNext);
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        if (error instanceof AppError) {
          expect(error.statusCode).toBe(401);
          expect(error.code).toBe(ErrorCodes.TOKEN_REQUIRED);
        }
      }
    });

    it('should throw TOKEN_REQUIRED error when Authorization header has no token', () => {
      mockReq.headers['authorization'] = 'Bearer';

      expect(() => {
        authenticateToken(mockReq, mockRes, mockNext);
      }).toThrow(AppError);

      try {
        authenticateToken(mockReq, mockRes, mockNext);
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        if (error instanceof AppError) {
          expect(error.statusCode).toBe(401);
          expect(error.code).toBe(ErrorCodes.TOKEN_REQUIRED);
        }
      }
    });

    it('should throw INVALID_TOKEN error when token is invalid', () => {
      mockReq.headers['authorization'] = 'Bearer invalid-token';
      (jwt.verify as jest.Mock).mockImplementation((token, secret, callback) => {
        callback(new Error('Invalid token'), null);
      });

      expect(() => {
        authenticateToken(mockReq, mockRes, mockNext);
      }).toThrow(AppError);

      try {
        authenticateToken(mockReq, mockRes, mockNext);
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        if (error instanceof AppError) {
          expect(error.statusCode).toBe(403);
          expect(error.code).toBe(ErrorCodes.INVALID_TOKEN);
        }
      }
    });

    it('should call next and populate req.user when token is valid', () => {
      const mockPayload: JWTPayload = {
        id: 1,
        email: 'test@test.com',
        role: 'CLIENTE'
      };
      mockReq.headers['authorization'] = 'Bearer valid-token';
      (jwt.verify as jest.Mock).mockImplementation((token, secret, callback) => {
        callback(null, mockPayload);
      });

      authenticateToken(mockReq, mockRes, mockNext);

      expect(jwt.verify).toHaveBeenCalledWith('valid-token', process.env.JWT_SECRET || 'your-secret-key', expect.any(Function));
      expect(mockReq.user).toEqual(mockPayload);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('requireRole', () => {
    it('should throw INSUFFICIENT_PERMISSIONS error when user role does not match', () => {
      mockReq.user = { id: 1, email: 'test@test.com', role: 'CLIENTE' };
      const middleware = requireRole('ADMIN');

      expect(() => {
        middleware(mockReq, mockRes, mockNext);
      }).toThrow(AppError);

      try {
        middleware(mockReq, mockRes, mockNext);
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        if (error instanceof AppError) {
          expect(error.statusCode).toBe(403);
          expect(error.code).toBe(ErrorCodes.INSUFFICIENT_PERMISSIONS);
        }
      }
    });

    it('should call next when user role matches', () => {
      mockReq.user = { id: 1, email: 'test@test.com', role: 'ADMIN' };
      const middleware = requireRole('ADMIN');

      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should call next when user has ADMIN role and ADMIN is required', () => {
      mockReq.user = { id: 1, email: 'admin@test.com', role: 'ADMIN' };
      const middleware = requireRole('ADMIN');

      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should call next when user has CLIENTE role and CLIENTE is required', () => {
      mockReq.user = { id: 1, email: 'client@test.com', role: 'CLIENTE' };
      const middleware = requireRole('CLIENTE');

      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });
});
