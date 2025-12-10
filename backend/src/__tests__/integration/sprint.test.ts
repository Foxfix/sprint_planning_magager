import request from 'supertest';
import express, { Express } from 'express';
import sprintRoutes from '@/routes/sprint.routes';
import { errorHandler } from '@/middleware/errorHandler';
import { authenticate } from '@/middleware/auth';
import prisma from '@/config/database';

jest.mock('@/middleware/auth', () => ({
  authenticate: (req: any, res: any, next: any) => {
    req.user = { userId: 'user-123', email: 'test@example.com' };
    next();
  },
}));

describe.skip('Sprint Controller Integration Tests', () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/sprints', sprintRoutes);
    app.use(errorHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/sprints/project/:projectId', () => {
    it('should create a new sprint successfully', async () => {
      const mockProject = {
        id: 'project-123',
        teamId: 'team-123',
      };
      const mockTeamMember = {
        userId: 'user-123',
        role: 'ADMIN',
      };
      const mockSprint = {
        id: 'sprint-123',
        projectId: 'project-123',
        name: 'Sprint 1',
        goal: 'Complete features',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-14'),
        status: 'PLANNED',
        createdAt: new Date(),
      };

      (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);
      (prisma.teamMember.findFirst as jest.Mock).mockResolvedValue(mockTeamMember);
      (prisma.sprint.create as jest.Mock).mockResolvedValue(mockSprint);

      const response = await request(app)
        .post('/api/sprints/project/project-123')
        .send({
          name: 'Sprint 1',
          goal: 'Complete features',
          startDate: '2024-01-01',
          endDate: '2024-01-14',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });
  });
});
