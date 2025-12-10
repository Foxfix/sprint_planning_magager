import { hashPassword, comparePassword } from '@/utils/password';
import bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('Password Utilities', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('hashPassword', () => {
    it('should hash a password successfully', async () => {
      const password = 'myPassword123';
      const hashedPassword = 'hashed_password_string';

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const result = await hashPassword(password);

      expect(result).toBe(hashedPassword);
      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
    });

    it('should throw error if hashing fails', async () => {
      const password = 'myPassword123';

      (bcrypt.hash as jest.Mock).mockRejectedValue(new Error('Hashing failed'));

      await expect(hashPassword(password)).rejects.toThrow('Hashing failed');
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching passwords', async () => {
      const password = 'myPassword123';
      const hash = 'hashed_password_string';

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await comparePassword(password, hash);

      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hash);
    });

    it('should return false for non-matching passwords', async () => {
      const password = 'wrongPassword';
      const hash = 'hashed_password_string';

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await comparePassword(password, hash);

      expect(result).toBe(false);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hash);
    });

    it('should throw error if comparison fails', async () => {
      const password = 'myPassword123';
      const hash = 'hashed_password_string';

      (bcrypt.compare as jest.Mock).mockRejectedValue(new Error('Comparison failed'));

      await expect(comparePassword(password, hash)).rejects.toThrow('Comparison failed');
    });
  });
});
