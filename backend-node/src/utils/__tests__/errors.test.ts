import { AppError, ErrorCodes, sendErrorResponse } from '../errors';

describe('Error utilities', () => {
  describe('AppError', () => {
    it('should create AppError with correct properties', () => {
      const error = new AppError('Not found', 404, ErrorCodes.EVENT_NOT_FOUND);

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Not found');
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('EVENT_NOT_FOUND');
      expect(error.isOperational).toBe(true);
    });

    it('should inherit from Error', () => {
      const error = new AppError('Test error', 400, ErrorCodes.INVALID_INPUT);

      expect(error instanceof Error).toBe(true);
      expect(error.message).toBe('Test error');
    });
  });

  describe('ErrorCodes', () => {
    it('should have TOKEN_REQUIRED constant', () => {
      expect(ErrorCodes.TOKEN_REQUIRED).toBe('TOKEN_REQUIRED');
    });

    it('should have INVALID_CREDENTIALS constant', () => {
      expect(ErrorCodes.INVALID_CREDENTIALS).toBe('INVALID_CREDENTIALS');
    });

    it('should have INTERNAL_SERVER_ERROR constant', () => {
      expect(ErrorCodes.INTERNAL_SERVER_ERROR).toBe('INTERNAL_SERVER_ERROR');
    });
  });

  describe('sendErrorResponse', () => {
    it('should send AppError response with correct status and body', () => {
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;

      const error = new AppError('Not found', 404, ErrorCodes.EVENT_NOT_FOUND);
      sendErrorResponse(mockRes, error);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Not found',
        code: 'EVENT_NOT_FOUND'
      });
    });

    it('should send generic error response for non-AppError', () => {
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Generic error');
      sendErrorResponse(mockRes, error);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Internal server error',
        code: ErrorCodes.INTERNAL_SERVER_ERROR
      });
      expect(consoleSpy).toHaveBeenCalledWith('Unexpected error:', error);
      consoleSpy.mockRestore();
    });
  });
});
