import { Router } from 'express';
import {
  createSprint,
  getSprints,
  getSprint,
  updateSprint,
  startSprint,
  completeSprint,
  deleteSprint,
  getSprintBurndown,
  createSprintValidation,
} from '../controllers/sprint.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/project/:projectId', createSprintValidation, createSprint);
router.get('/project/:projectId', getSprints);
router.get('/:id', getSprint);
router.patch('/:id', updateSprint);
router.post('/:id/start', startSprint);
router.post('/:id/complete', completeSprint);
router.delete('/:id', deleteSprint);
router.get('/:id/burndown', getSprintBurndown);

export default router;
