import request from 'supertest';
import express, { Express } from 'express';
import authRoutes from '@/routes/auth.routes';
import { errorHandler } from '@/middleware/errorHandler';
import prisma from '@/config/database';
import * as passwordUtils from '@/utils/password';
import * as jwtUtils from '@/utils/jwt';

jest.mock('@/utils/password');
jest.mock('@/utils/jwt');

describe.skip('Auth Controller Integration Tests', () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
    app.use(errorHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        login: 'testuser',
        avatarUrl: null,
        createdAt: new Date(),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (passwordUtils.hashPassword as jest.Mock).mockResolvedValue('hashed-password');
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);
      (jwtUtils.generateToken as jest.Mock).mockReturnValue('mock-jwt-token');

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          name: 'Test User',
          login: 'testuser',
          password: 'password123',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
    });
  });
});
