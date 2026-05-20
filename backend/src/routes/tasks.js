import { Router } from 'express';
import protect from '../middleware/authMiddleware.js';
import { loadWorkspace } from '../middleware/workspaceMiddleware.js';
import { loadProject } from '../middleware/projectMiddleware.js';
import {
  getTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js';

/**
 * Nested under /api/workspaces/:workspaceId/projects/:projectId/tasks
 * mergeParams: true gives access to both :workspaceId and :projectId.
 */
const router = Router({ mergeParams: true });

// Auth + workspace membership + project existence on every request
router.use(protect);
router.use(loadWorkspace);
router.use(loadProject);

// Collection
router.get('/',  getTasks);
router.post('/', createTask);

// Single task
router.get('/:taskId',    getTask);
router.patch('/:taskId',  updateTask);
router.delete('/:taskId', deleteTask);

export default router;
