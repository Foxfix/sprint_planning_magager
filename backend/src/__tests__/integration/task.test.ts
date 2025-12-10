import request from 'supertest';
import express, { Express } from 'express';
import taskRoutes from '@/routes/task.routes';
import { errorHandler } from '@/middleware/errorHandler';
import prisma from '@/config/database';

jest.mock('@/middleware/auth', () => ({
  authenticate: (req: any, res: any, next: any) => {
    req.user = { userId: 'user-123', email: 'test@example.com' };
    next();
  },
}));

describe.skip('Task Controller Integration Tests', () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/tasks', taskRoutes);
    app.use(errorHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/tasks/project/:projectId', () => {
    it('should create a new task successfully', async () => {
      const mockProject = {
        id: 'project-123',
        teamId: 'team-123',
        key: 'PROJ',
      };
      const mockTeamMember = { userId: 'user-123', role: 'MEMBER' };
      const mockTaskCount = 5;
      const mockTask = {
        id: 'task-123',
        projectId: 'project-123',
        taskNumber: 6,
        title: 'New Task',
        type: 'TASK',
        status: 'TODO',
        priority: 'MEDIUM',
        position: 0,
        labels: [],
        creatorId: 'user-123',
        createdAt: new Date(),
      };

      (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);
      (prisma.teamMember.findFirst as jest.Mock).mockResolvedValue(mockTeamMember);
      (prisma.task.count as jest.Mock).mockResolvedValue(mockTaskCount);
      (prisma.task.create as jest.Mock).mockResolvedValue(mockTask);

      const response = await request(app)
        .post('/api/tasks/project/project-123')
        .send({
          title: 'New Task',
          type: 'TASK',
          status: 'TODO',
          priority: 'MEDIUM',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });
  });
});
