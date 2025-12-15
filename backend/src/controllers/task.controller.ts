import { Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const createTaskValidation = [
  body('title').trim().notEmpty().withMessage('Task title is required'),
];

async function verifyProjectAccess(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { team: true },
  });

  if (!project) {
    throw new AppError(404, 'Project not found');
  }

  const membership = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId: project.teamId, userId } },
  });

  if (!membership) {
    throw new AppError(403, 'Access denied');
  }

  return project;
}

export async function createTask(req: AuthRequest, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { projectId } = req.params;
  const { title, description, type, status, priority, storyPoints, assigneeId, labels, sprintId } = req.body;
  const userId = req.user!.userId;

  await verifyProjectAccess(projectId, userId);

  const lastTask = await prisma.task.findFirst({
    where: { projectId },
    orderBy: { taskNumber: 'desc' },
  });

  const taskNumber = (lastTask?.taskNumber || 0) + 1;

  const task = await prisma.task.create({
    data: {
      projectId,
      sprintId,
      taskNumber,
      title,
      description,
      type: type || 'TASK',
      status: status || 'TODO',
      priority: priority || 'MEDIUM',
      storyPoints,
      creatorId: userId,
      assigneeId,
      labels: labels || [],
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
      project: {
        select: {
          id: true,
          name: true,
          key: true,
        },
      },
    },
  });

  await prisma.activityLog.create({
    data: {
      taskId: task.id,
      userId,
      action: 'created',
      newValue: 'Task created',
    },
  });

  return res.status(201).json(task);
}

export async function getTasks(req: AuthRequest, res: Response) {
  const { projectId } = req.params;
  const { status, sprintId, assigneeId } = req.query;
  const userId = req.user!.userId;

  await verifyProjectAccess(projectId, userId);

  const where: Record<string, unknown> = { projectId };
  if (status) where.status = status;
  if (sprintId) where.sprintId = sprintId;
  if (assigneeId) where.assigneeId = assigneeId;

  const tasks = await prisma.task.findMany({
    where,
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
      project: {
        select: {
          id: true,
          name: true,
          key: true,
        },
      },
      _count: {
        select: {
          comments: true,
        },
      },
    },
    orderBy: [{ position: 'asc' }, { createdAt: 'desc' }],
  });

  res.json(tasks);
}

export async function getSprintTasks(req: AuthRequest, res: Response) {
  const { sprintId } = req.params;
  const userId = req.user!.userId;

  const sprint = await prisma.sprint.findUnique({
    where: { id: sprintId },
  });

  if (!sprint) {
    throw new AppError(404, 'Sprint not found');
  }

  await verifyProjectAccess(sprint.projectId, userId);

  const tasks = await prisma.task.findMany({
    where: { sprintId },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
      _count: {
        select: {
          comments: true,
        },
      },
    },
    orderBy: [{ status: 'asc' }, { position: 'asc' }],
  });

  res.json(tasks);
}

export async function getTask(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const userId = req.user!.userId;

  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
      project: {
        select: {
          id: true,
          name: true,
          key: true,
          teamId: true,
        },
      },
      sprint: {
        select: {
          id: true,
          name: true,
          status: true,
        },
      },
      comments: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      activityLog: {
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
    },
  });

  if (!task) {
    throw new AppError(404, 'Task not found');
  }

  await verifyProjectAccess(task.projectId, userId);

  res.json(task);
}

export async function updateTask(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const updates = req.body;
  const userId = req.user!.userId;

  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) {
    throw new AppError(404, 'Task not found');
  }

  await verifyProjectAccess(task.projectId, userId);

  const updatedTask = await prisma.task.update({
    where: { id },
    data: updates,
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
  });

  for (const [key, value] of Object.entries(updates)) {
    if (task[key as keyof typeof task] !== value) {
      await prisma.activityLog.create({
        data: {
          taskId: id,
          userId,
          action: `updated ${key}`,
          oldValue: String(task[key as keyof typeof task] || ''),
          newValue: String(value || ''),
        },
      });
    }
  }

  res.json(updatedTask);
}

export async function moveTask(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { status, position, sprintId, assigneeId } = req.body;
  const userId = req.user!.userId;

  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      sprint: {
        select: {
          id: true,
          status: true,
        },
      },
    },
  });

  if (!task) {
    throw new AppError(404, 'Task not found');
  }

  await verifyProjectAccess(task.projectId, userId);

  // Prevent moving DONE tasks from completed sprints
  if (task.status === 'DONE' && task.sprint?.status === 'COMPLETED' && status !== 'DONE') {
    throw new AppError(400, 'Cannot move completed tasks from a finished sprint');
  }

  const updatedTask = await prisma.task.update({
    where: { id },
    data: {
      status,
      position,
      sprintId: sprintId !== undefined ? sprintId : undefined,
      assigneeId: assigneeId !== undefined ? assigneeId : undefined,
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
          login: true,
          avatarUrl: true,
        },
      },
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
          login: true,
          avatarUrl: true,
        },
      },
    },
  });

  if (task.status !== status) {
    await prisma.activityLog.create({
      data: {
        taskId: id,
        userId,
        action: 'status changed',
        oldValue: task.status,
        newValue: status,
      },
    });
  }

  if (task.assigneeId !== assigneeId && assigneeId !== undefined) {
    await prisma.activityLog.create({
      data: {
        taskId: id,
        userId,
        action: 'assignee changed',
        oldValue: task.assigneeId || 'unassigned',
        newValue: assigneeId || 'unassigned',
      },
    });
  }

  res.json(updatedTask);
}

export async function deleteTask(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const userId = req.user!.userId;

  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) {
    throw new AppError(404, 'Task not found');
  }

  await verifyProjectAccess(task.projectId, userId);

  await prisma.task.delete({ where: { id } });

  res.status(204).send();
}

export async function createComment(req: AuthRequest, res: Response) {
  const { taskId } = req.params;
  const { content } = req.body;
  const userId = req.user!.userId;

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) {
    throw new AppError(404, 'Task not found');
  }

  await verifyProjectAccess(task.projectId, userId);

  const comment = await prisma.comment.create({
    data: {
      taskId,
      userId,
      content,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
  });

  await prisma.activityLog.create({
    data: {
      taskId,
      userId,
      action: 'commented',
      newValue: content.substring(0, 100),
    },
  });

  return res.status(201).json(comment);
}

export async function getComments(req: AuthRequest, res: Response) {
  const { taskId } = req.params;
  const userId = req.user!.userId;

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) {
    throw new AppError(404, 'Task not found');
  }

  await verifyProjectAccess(task.projectId, userId);

  const comments = await prisma.comment.findMany({
    where: { taskId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json(comments);
}
