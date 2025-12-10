import { generateToken, verifyToken } from '@/utils/jwt';
import jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');

describe('JWT Utilities', () => {
  const mockSecret = 'test-secret-key';

  beforeAll(() => {
    process.env.JWT_SECRET = mockSecret;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const payload = { userId: 'user-123', email: 'test@example.com' };
      const mockToken = 'mock.jwt.token';

      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      const result = generateToken(payload);

      expect(result).toBe(mockToken);
      expect(jwt.sign).toHaveBeenCalledWith(
        payload,
        mockSecret,
        expect.objectContaining({ expiresIn: expect.any(String) })
      );
    });

    it('should include expiration time', () => {
      const payload = { userId: 'user-123', email: 'test@example.com' };

      (jwt.sign as jest.Mock).mockReturnValue('token');

      generateToken(payload);

      expect(jwt.sign).toHaveBeenCalledWith(
        payload,
        mockSecret,
        expect.objectContaining({ expiresIn: expect.stringMatching(/\d+[dhm]/) })
      );
    });
  });

  describe('verifyToken', () => {
    it('should verify and decode a valid token', () => {
      const token = 'valid.jwt.token';
      const decoded = { userId: 'user-123', email: 'test@example.com' };

      (jwt.verify as jest.Mock).mockReturnValue(decoded);

      const result = verifyToken(token);

      expect(result).toEqual(decoded);
      expect(jwt.verify).toHaveBeenCalledWith(token, mockSecret);
    });

    it('should throw error for invalid token', () => {
      const token = 'invalid.jwt.token';

      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => verifyToken(token)).toThrow('Invalid or expired token');
    });

    it('should throw error for expired token', () => {
      const token = 'expired.jwt.token';

      (jwt.verify as jest.Mock).mockImplementation(() => {
        const error: any = new Error('Token expired');
        error.name = 'TokenExpiredError';
        throw error;
      });

      expect(() => verifyToken(token)).toThrow('Invalid or expired token');
    });
  });
});
