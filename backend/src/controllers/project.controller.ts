import { Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const createProjectValidation = [
  body('name').trim().notEmpty().withMessage('Project name is required'),
  body('key').trim().notEmpty().withMessage('Project key is required'),
  body('teamId').notEmpty().withMessage('Team ID is required'),
];

export async function createProject(req: AuthRequest, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { teamId, name, key, description } = req.body;
  const userId = req.user!.userId;

  const membership = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId } },
  });

  if (!membership) {
    throw new AppError(403, 'You must be a team member to create projects');
  }

  const existingProject = await prisma.project.findUnique({
    where: { teamId_key: { teamId, key } },
  });

  if (existingProject) {
    throw new AppError(409, 'Project key already exists in this team');
  }

  const project = await prisma.project.create({
    data: {
      teamId,
      name,
      key: key.toUpperCase(),
      description,
    },
    include: {
      team: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  return res.status(201).json(project);
}

export async function getProjects(req: AuthRequest, res: Response) {
  const { teamId } = req.params;
  const userId = req.user!.userId;

  const membership = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId } },
  });

  if (!membership) {
    throw new AppError(403, 'Access denied');
  }

  const projects = await prisma.project.findMany({
    where: { teamId },
    include: {
      _count: {
        select: {
          tasks: true,
          sprints: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json(projects);
}

export async function getProject(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const userId = req.user!.userId;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      team: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      _count: {
        select: {
          tasks: true,
          sprints: true,
        },
      },
    },
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

  res.json(project);
}

export async function updateProject(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { name, description, isArchived } = req.body;
  const userId = req.user!.userId;

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) {
    throw new AppError(404, 'Project not found');
  }

  const membership = await prisma.teamMember.findFirst({
    where: { teamId: project.teamId, userId, role: 'ADMIN' },
  });

  if (!membership) {
    throw new AppError(403, 'Only team admins can update projects');
  }

  const updatedProject = await prisma.project.update({
    where: { id },
    data: { name, description, isArchived },
    include: {
      team: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  res.json(updatedProject);
}

export async function deleteProject(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const userId = req.user!.userId;

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) {
    throw new AppError(404, 'Project not found');
  }

  const membership = await prisma.teamMember.findFirst({
    where: { teamId: project.teamId, userId, role: 'ADMIN' },
  });

  if (!membership) {
    throw new AppError(403, 'Only team admins can delete projects');
  }

  await prisma.project.delete({ where: { id } });

  res.status(204).send();
}
