import { Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const createSprintValidation = [
  body('name').trim().notEmpty().withMessage('Sprint name is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
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

export async function createSprint(req: AuthRequest, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { projectId } = req.params;
  const { name, goal, startDate, endDate } = req.body;
  const userId = req.user!.userId;

  await verifyProjectAccess(projectId, userId);

  const sprint = await prisma.sprint.create({
    data: {
      projectId,
      name,
      goal,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    },
  });

  return res.status(201).json(sprint);
}

export async function getSprints(req: AuthRequest, res: Response) {
  const { projectId } = req.params;
  const userId = req.user!.userId;

  await verifyProjectAccess(projectId, userId);

  const sprints = await prisma.sprint.findMany({
    where: { projectId },
    include: {
      _count: {
        select: { tasks: true },
      },
    },
    orderBy: { startDate: 'desc' },
  });

  res.json(sprints);
}

export async function getSprint(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const userId = req.user!.userId;

  const sprint = await prisma.sprint.findUnique({
    where: { id },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          key: true,
          teamId: true,
        },
      },
      _count: {
        select: { tasks: true },
      },
    },
  });

  if (!sprint) {
    throw new AppError(404, 'Sprint not found');
  }

  await verifyProjectAccess(sprint.projectId, userId);

  res.json(sprint);
}

export async function updateSprint(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { name, goal, startDate, endDate, status } = req.body;
  const userId = req.user!.userId;

  const sprint = await prisma.sprint.findUnique({ where: { id } });
  if (!sprint) {
    throw new AppError(404, 'Sprint not found');
  }

  await verifyProjectAccess(sprint.projectId, userId);

  const updatedSprint = await prisma.sprint.update({
    where: { id },
    data: {
      name,
      goal,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      status,
    },
  });

  res.json(updatedSprint);
}

export async function startSprint(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const userId = req.user!.userId;

  const sprint = await prisma.sprint.findUnique({ where: { id } });
  if (!sprint) {
    throw new AppError(404, 'Sprint not found');
  }

  await verifyProjectAccess(sprint.projectId, userId);

  const activeSprint = await prisma.sprint.findFirst({
    where: { projectId: sprint.projectId, status: 'ACTIVE' },
  });

  if (activeSprint) {
    throw new AppError(400, 'There is already an active sprint for this project');
  }

  const updatedSprint = await prisma.sprint.update({
    where: { id },
    data: { status: 'ACTIVE' },
  });

  res.json(updatedSprint);
}

export async function completeSprint(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const userId = req.user!.userId;

  const sprint = await prisma.sprint.findUnique({ where: { id } });
  if (!sprint) {
    throw new AppError(404, 'Sprint not found');
  }

  await verifyProjectAccess(sprint.projectId, userId);

  const updatedSprint = await prisma.sprint.update({
    where: { id },
    data: { status: 'COMPLETED' },
  });

  res.json(updatedSprint);
}

export async function deleteSprint(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const userId = req.user!.userId;

  const sprint = await prisma.sprint.findUnique({ where: { id } });
  if (!sprint) {
    throw new AppError(404, 'Sprint not found');
  }

  await verifyProjectAccess(sprint.projectId, userId);

  await prisma.sprint.delete({ where: { id } });

  res.status(204).send();
}

export async function getSprintBurndown(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const userId = req.user!.userId;

  const sprint = await prisma.sprint.findUnique({
    where: { id },
    include: {
      tasks: {
        select: {
          id: true,
          storyPoints: true,
          status: true,
          updatedAt: true,
        },
      },
    },
  });

  if (!sprint) {
    throw new AppError(404, 'Sprint not found');
  }

  await verifyProjectAccess(sprint.projectId, userId);

  const totalPoints = sprint.tasks.reduce((sum, task) => sum + (task.storyPoints || 0), 0);
  const completedPoints = sprint.tasks
    .filter(task => task.status === 'DONE')
    .reduce((sum, task) => sum + (task.storyPoints || 0), 0);

  const remainingPoints = totalPoints - completedPoints;

  const dailyProgress = [];
  const startDate = new Date(sprint.startDate);
  const endDate = new Date(sprint.endDate);
  const today = new Date();
  const currentDate = today < endDate ? today : endDate;

  const daysInSprint = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const idealBurnRate = totalPoints / daysInSprint;

  for (let d = new Date(startDate); d <= currentDate; d.setDate(d.getDate() + 1)) {
    const dayEnd = new Date(d);
    dayEnd.setHours(23, 59, 59, 999);

    const completedByDay = sprint.tasks
      .filter(task => task.status === 'DONE' && new Date(task.updatedAt) <= dayEnd)
      .reduce((sum, task) => sum + (task.storyPoints || 0), 0);

    const daysElapsed = Math.ceil((d.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const idealRemaining = Math.max(0, totalPoints - (idealBurnRate * daysElapsed));

    dailyProgress.push({
      date: d.toISOString().split('T')[0],
      remaining: totalPoints - completedByDay,
      ideal: idealRemaining,
    });
  }

  res.json({
    totalPoints,
    completedPoints,
    remainingPoints,
    dailyProgress,
  });
}
