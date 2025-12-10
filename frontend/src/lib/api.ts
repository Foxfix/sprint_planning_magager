const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));

    // Auto logout on 404 User not found (stale token)
    if (response.status === 404 && error.error === 'User not found' && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    throw new ApiError(response.status, error.error || 'Request failed');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export const api = {
  auth: {
    register: (data: { email: string; name: string; password: string }) =>
      fetchApi<{ user: any; token: string }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    login: (data: { email: string; password: string }) =>
      fetchApi<{ user: any; token: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getMe: () => fetchApi<{ user: any }>('/api/auth/me'),
  },
  teams: {
    create: (data: { name: string; slug: string; description?: string }) =>
      fetchApi<any>('/api/teams', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getAll: () => fetchApi<any[]>('/api/teams'),
    getById: (id: string) => fetchApi<any>(`/api/teams/${id}`),
    update: (id: string, data: { name?: string; description?: string }) =>
      fetchApi<any>(`/api/teams/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetchApi<void>(`/api/teams/${id}`, {
        method: 'DELETE',
      }),
    addMember: (id: string, data: { email: string; role?: string }) =>
      fetchApi<any>(`/api/teams/${id}/members`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
  projects: {
    create: (data: { teamId: string; name: string; key: string; description?: string }) =>
      fetchApi<any>('/api/projects', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getByTeam: (teamId: string) => fetchApi<any[]>(`/api/projects/team/${teamId}`),
    getById: (id: string) => fetchApi<any>(`/api/projects/${id}`),
    update: (id: string, data: { name?: string; description?: string; isArchived?: boolean }) =>
      fetchApi<any>(`/api/projects/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
  },
  sprints: {
    create: (projectId: string, data: { name: string; goal?: string; startDate: string; endDate: string }) =>
      fetchApi<any>(`/api/sprints/project/${projectId}`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getByProject: (projectId: string) => fetchApi<any[]>(`/api/sprints/project/${projectId}`),
    getById: (id: string) => fetchApi<any>(`/api/sprints/${id}`),
    update: (id: string, data: any) =>
      fetchApi<any>(`/api/sprints/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    start: (id: string) => fetchApi<any>(`/api/sprints/${id}/start`, { method: 'POST' }),
    complete: (id: string) => fetchApi<any>(`/api/sprints/${id}/complete`, { method: 'POST' }),
    getBurndown: (id: string) => fetchApi<any>(`/api/sprints/${id}/burndown`),
  },
  tasks: {
    create: (projectId: string, data: any) =>
      fetchApi<any>(`/api/tasks/project/${projectId}`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getByProject: (projectId: string, params?: { status?: string; sprintId?: string; assigneeId?: string }) => {
      const query = new URLSearchParams(params as any).toString();
      return fetchApi<any[]>(`/api/tasks/project/${projectId}${query ? `?${query}` : ''}`);
    },
    getBySprint: (sprintId: string) => fetchApi<any[]>(`/api/tasks/sprint/${sprintId}`),
    getById: (id: string) => fetchApi<any>(`/api/tasks/${id}`),
    update: (id: string, data: any) =>
      fetchApi<any>(`/api/tasks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    move: (id: string, data: { status: string; position: number; sprintId?: string | null; assigneeId?: string | null }) =>
      fetchApi<any>(`/api/tasks/${id}/move`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetchApi<void>(`/api/tasks/${id}`, {
        method: 'DELETE',
      }),
    createComment: (taskId: string, content: string) =>
      fetchApi<any>(`/api/tasks/${taskId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      }),
    getComments: (taskId: string) => fetchApi<any[]>(`/api/tasks/${taskId}/comments`),
  },
};
