import { Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const createTeamValidation = [
  body('name').trim().notEmpty().withMessage('Team name is required'),
  body('slug').trim().notEmpty().withMessage('Team slug is required'),
];

export async function createTeam(req: AuthRequest, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, slug, description } = req.body;
  const userId = req.user!.userId;

  const existingTeam = await prisma.team.findUnique({ where: { slug } });
  if (existingTeam) {
    throw new AppError(409, 'Team slug already exists');
  }

  const team = await prisma.team.create({
    data: {
      name,
      slug,
      description,
      members: {
        create: {
          userId,
          role: 'ADMIN',
        },
      },
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              login: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
  });

  return res.status(201).json(team);
}

export async function getTeams(req: AuthRequest, res: Response) {
  const userId = req.user!.userId;

  const teams = await prisma.team.findMany({
    where: {
      members: {
        some: {
          userId,
        },
      },
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              login: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
      },
      _count: {
        select: {
          projects: true,
        },
      },
    },
  });

  res.json(teams);
}

export async function getTeam(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const userId = req.user!.userId;

  const team = await prisma.team.findFirst({
    where: {
      id,
      members: {
        some: {
          userId,
        },
      },
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              login: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
      },
      projects: {
        include: {
          _count: {
            select: {
              tasks: true,
              sprints: true,
            },
          },
        },
      },
    },
  });

  if (!team) {
    throw new AppError(404, 'Team not found');
  }

  res.json(team);
}

export async function updateTeam(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { name, description } = req.body;
  const userId = req.user!.userId;

  const membership = await prisma.teamMember.findFirst({
    where: { teamId: id, userId, role: 'ADMIN' },
  });

  if (!membership) {
    throw new AppError(403, 'Only team admins can update team details');
  }

  const team = await prisma.team.update({
    where: { id },
    data: { name, description },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              login: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
  });

  res.json(team);
}

export async function deleteTeam(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const userId = req.user!.userId;

  const membership = await prisma.teamMember.findFirst({
    where: { teamId: id, userId, role: 'ADMIN' },
  });

  if (!membership) {
    throw new AppError(403, 'Only team admins can delete teams');
  }

  await prisma.team.delete({ where: { id } });

  res.status(204).send();
}

export async function addTeamMember(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { email, role } = req.body;
  const userId = req.user!.userId;

  const membership = await prisma.teamMember.findFirst({
    where: { teamId: id, userId, role: 'ADMIN' },
  });

  if (!membership) {
    throw new AppError(403, 'Only team admins can add members');
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError(404, 'User not found');
  }

  const existingMember = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId: id, userId: user.id } },
  });

  if (existingMember) {
    throw new AppError(409, 'User is already a team member');
  }

  const newMember = await prisma.teamMember.create({
    data: {
      teamId: id,
      userId: user.id,
      role: role || 'MEMBER',
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
  });

  return res.status(201).json(newMember);
}

export async function removeTeamMember(req: AuthRequest, res: Response) {
  const { id, memberId } = req.params;
  const userId = req.user!.userId;

  const membership = await prisma.teamMember.findFirst({
    where: { teamId: id, userId, role: 'ADMIN' },
  });

  if (!membership) {
    throw new AppError(403, 'Only team admins can remove members');
  }

  await prisma.teamMember.delete({
    where: { teamId_userId: { teamId: id, userId: memberId } },
  });

  res.status(204).send();
}
