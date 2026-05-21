import { Router } from 'express';
import protect from '../middleware/authMiddleware.js';
import { loadWorkspace } from '../middleware/workspaceMiddleware.js';
import { loadProject } from '../middleware/projectMiddleware.js';
import {
  generateSummary,
  generateStandup,
  generateBreakdown,
} from '../controllers/aiController.js';

/**
 * Nested under /api/workspaces/:workspaceId/projects/:projectId/ai
 * mergeParams: true gives access to both :workspaceId and :projectId.
 */
const router = Router({ mergeParams: true });

// All AI routes require auth + workspace membership + project existence
router.use(protect);
router.use(loadWorkspace);
router.use(loadProject);

router.post('/summary',   generateSummary);
router.post('/standup',   generateStandup);
router.post('/breakdown', generateBreakdown);

export default router;
