import { Router } from 'express';
import {
  createTask,
  getTasks,
  getSprintTasks,
  getTask,
  updateTask,
  moveTask,
  deleteTask,
  createComment,
  getComments,
  createTaskValidation,
} from '../controllers/task.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/project/:projectId', createTaskValidation, createTask);
router.get('/project/:projectId', getTasks);
router.get('/sprint/:sprintId', getSprintTasks);
router.patch('/:id/move', moveTask); // Must be before /:id to avoid route conflict
router.post('/:taskId/comments', createComment);
router.get('/:taskId/comments', getComments);
router.get('/:id', getTask);
router.patch('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;
