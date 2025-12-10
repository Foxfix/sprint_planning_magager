export interface User {
  id: string;
  email: string;
  login?: string;
  name: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Team {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
  members: TeamMember[];
}

export interface TeamMember {
  id: string;
  role: 'ADMIN' | 'MEMBER';
  user: User;
  joinedAt: string;
}

export interface Project {
  id: string;
  teamId: string;
  name: string;
  key: string;
  description?: string;
  isArchived: boolean;
  createdAt: string;
  team?: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface Sprint {
  id: string;
  projectId: string;
  name: string;
  goal?: string;
  startDate: string;
  endDate: string;
  status: 'PLANNED' | 'ACTIVE' | 'COMPLETED';
  createdAt: string;
}

export type TaskType = 'EPIC' | 'STORY' | 'TASK' | 'BUG';
export type TaskStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Task {
  id: string;
  projectId: string;
  sprintId?: string | null;
  taskNumber: number;
  title: string;
  description?: string;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  storyPoints?: number;
  labels: string[];
  position: number;
  createdAt: string;
  creator: User;
  assignee?: User;
  project: {
    id: string;
    name: string;
    key: string;
  };
}

export interface Comment {
  id: string;
  taskId: string;
  content: string;
  createdAt: string;
  user: User;
}

export interface ActivityLog {
  id: string;
  taskId: string;
  userId: string;
  action: string;
  oldValue?: string;
  newValue?: string;
  createdAt: string;
}
