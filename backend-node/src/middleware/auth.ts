import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorCodes } from '../utils/errors';
import { JWTPayload, UserRole } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    throw new AppError('Access token required', 401, ErrorCodes.TOKEN_REQUIRED);
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      throw new AppError('Invalid or expired token', 403, ErrorCodes.INVALID_TOKEN);
    }
    (req as any).user = user as JWTPayload;
    next();
  });
}

function requireRole(role: UserRole): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction): void => {
    if ((req as any).user?.role !== role) {
      throw new AppError('Insufficient permissions', 403, ErrorCodes.INSUFFICIENT_PERMISSIONS);
    }
    next();
  };
}

export {
  authenticateToken,
  requireRole
};
