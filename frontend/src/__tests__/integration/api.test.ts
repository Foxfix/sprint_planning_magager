import { api, ApiError } from '@/lib/api';

global.fetch = jest.fn();

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('ApiError', () => {
    it('should create ApiError with status and message', () => {
      const error = new ApiError(404, 'Not found');
      expect(error.status).toBe(404);
      expect(error.message).toBe('Not found');
      expect(error.name).toBe('ApiError');
    });
  });

  describe('Authentication', () => {
    describe('register', () => {
      it('should register a new user', async () => {
        const mockResponse = {
          user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
          token: 'mock-token',
        };

        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        });

        const result = await api.auth.register({
          email: 'test@example.com',
          name: 'Test User',
          password: 'password123',
        });

        expect(result).toEqual(mockResponse);
        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:3001/api/auth/register',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({
              email: 'test@example.com',
              name: 'Test User',
              password: 'password123',
            }),
          })
        );
      });

      it('should throw ApiError on registration failure', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 409,
          json: async () => ({ error: 'Email already registered' }),
        });

        await expect(
          api.auth.register({
            email: 'existing@example.com',
            name: 'Test User',
            password: 'password123',
          })
        ).rejects.toThrow('Email already registered');
      });
    });

    describe('login', () => {
      it('should login user with valid credentials', async () => {
        const mockResponse = {
          user: { id: 'user-1', email: 'test@example.com' },
          token: 'mock-token',
        };

        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        });

        const result = await api.auth.login({
          email: 'test@example.com',
          password: 'password123',
        });

        expect(result).toEqual(mockResponse);
      });

      it('should throw ApiError on invalid credentials', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: async () => ({ error: 'Invalid credentials' }),
        });

        await expect(
          api.auth.login({
            email: 'wrong@example.com',
            password: 'wrongpass',
          })
        ).rejects.toThrow('Invalid credentials');
      });
    });

    describe('getMe', () => {
      it('should fetch current user with token', async () => {
        localStorage.setItem('token', 'valid-token');

        const mockUser = {
          user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
        };

        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockUser,
        });

        const result = await api.auth.getMe();

        expect(result).toEqual(mockUser);
        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:3001/api/auth/me',
          expect.objectContaining({
            headers: expect.objectContaining({
              Authorization: 'Bearer valid-token',
            }),
          })
        );
      });

      it('should auto-logout on 404 User not found', async () => {
        localStorage.setItem('token', 'stale-token');

        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 404,
          json: async () => ({ error: 'User not found' }),
        });

        await expect(api.auth.getMe()).rejects.toThrow();

        // Verify token was removed
        expect(localStorage.getItem('token')).toBeNull();
        // Note: window.location.href assignment is not easily testable in jsdom
      });
    });
  });

  describe('Tasks', () => {
    describe('create', () => {
      it('should create a new task', async () => {
        const mockTask = {
          id: 'task-1',
          title: 'New Task',
          status: 'TODO',
          type: 'TASK',
          priority: 'MEDIUM',
        };

        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockTask,
        });

        const result = await api.tasks.create('project-123', {
          title: 'New Task',
          type: 'TASK',
          status: 'TODO',
          priority: 'MEDIUM',
        });

        expect(result).toEqual(mockTask);
        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:3001/api/tasks/project/project-123',
          expect.objectContaining({
            method: 'POST',
          })
        );
      });
    });

    describe('move', () => {
      it('should move task to new status', async () => {
        const mockTask = {
          id: 'task-1',
          status: 'IN_PROGRESS',
          position: 0,
        };

        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockTask,
        });

        const result = await api.tasks.move('task-1', {
          status: 'IN_PROGRESS',
          position: 0,
        });

        expect(result).toEqual(mockTask);
        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:3001/api/tasks/task-1/move',
          expect.objectContaining({
            method: 'PATCH',
            body: JSON.stringify({
              status: 'IN_PROGRESS',
              position: 0,
            }),
          })
        );
      });

      it('should move task to backlog with null sprintId', async () => {
        const mockTask = {
          id: 'task-1',
          status: 'TODO',
          position: 0,
          sprintId: null,
        };

        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockTask,
        });

        const result = await api.tasks.move('task-1', {
          status: 'TODO',
          position: 0,
          sprintId: null,
        });

        expect(result.sprintId).toBeNull();
      });
    });

    describe('delete', () => {
      it('should delete a task', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          status: 204,
        });

        const result = await api.tasks.delete('task-1');

        expect(result).toBeUndefined();
        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:3001/api/tasks/task-1',
          expect.objectContaining({
            method: 'DELETE',
          })
        );
      });
    });
  });

  describe('Sprints', () => {
    describe('start', () => {
      it('should start a sprint', async () => {
        const mockSprint = {
          id: 'sprint-1',
          status: 'ACTIVE',
        };

        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockSprint,
        });

        const result = await api.sprints.start('sprint-1');

        expect(result.status).toBe('ACTIVE');
        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:3001/api/sprints/sprint-1/start',
          expect.objectContaining({
            method: 'POST',
          })
        );
      });
    });

    describe('complete', () => {
      it('should complete a sprint', async () => {
        const mockSprint = {
          id: 'sprint-1',
          status: 'COMPLETED',
        };

        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockSprint,
        });

        const result = await api.sprints.complete('sprint-1');

        expect(result.status).toBe('COMPLETED');
        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:3001/api/sprints/sprint-1/complete',
          expect.objectContaining({
            method: 'POST',
          })
        );
      });
    });
  });
});
