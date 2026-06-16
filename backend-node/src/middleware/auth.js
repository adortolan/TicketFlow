const jwt = require('jsonwebtoken');
const { AppError, ErrorCodes } = require('../utils/errors');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    throw new AppError('Access token required', 401, ErrorCodes.TOKEN_REQUIRED);
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      throw new AppError('Invalid or expired token', 403, ErrorCodes.INVALID_TOKEN);
    }
    req.user = user;
    next();
  });
}

function requireRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      throw new AppError('Insufficient permissions', 403, ErrorCodes.INSUFFICIENT_PERMISSIONS);
    }
    next();
  };
}

module.exports = {
  authenticateToken,
  requireRole
};
