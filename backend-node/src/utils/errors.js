// Standardized error codes
const ErrorCodes = {
  // Authentication errors (4xx)
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_REQUIRED: 'TOKEN_REQUIRED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  
  // Validation errors (4xx)
  MISSING_FIELDS: 'MISSING_FIELDS',
  INVALID_INPUT: 'INVALID_INPUT',
  EMAIL_ALREADY_REGISTERED: 'EMAIL_ALREADY_REGISTERED',
  CPF_ALREADY_REGISTERED: 'CPF_ALREADY_REGISTERED',
  
  // Not found errors (4xx)
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  EVENT_NOT_FOUND: 'EVENT_NOT_FOUND',
  ORDER_NOT_FOUND: 'ORDER_NOT_FOUND',
  
  // Server errors (5xx)
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  RABBITMQ_ERROR: 'RABBITMQ_ERROR'
};

class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const sendErrorResponse = (res, error) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: error.message,
      code: error.code
    });
  }
  
  // Handle unexpected errors
  console.error('Unexpected error:', error);
  return res.status(500).json({
    error: 'Internal server error',
    code: ErrorCodes.INTERNAL_SERVER_ERROR
  });
};

module.exports = {
  ErrorCodes,
  AppError,
  sendErrorResponse
};