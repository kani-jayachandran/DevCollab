import { Router } from 'express';
import protect from '../middleware/authMiddleware.js';
import { loadWorkspace } from '../middleware/workspaceMiddleware.js';
import { loadProject } from '../middleware/projectMiddleware.js';
import {
  getSnippets,
  createSnippet,
  getSnippet,
  updateSnippet,
  deleteSnippet,
} from '../controllers/snippetController.js';

/**
 * Nested under /api/workspaces/:workspaceId/projects/:projectId/snippets
 * mergeParams: true gives access to both :workspaceId and :projectId.
 */
const router = Router({ mergeParams: true });

router.use(protect);
router.use(loadWorkspace);
router.use(loadProject);

// Collection
router.get('/',  getSnippets);
router.post('/', createSnippet);

// Single snippet
router.get('/:snippetId',    getSnippet);
router.patch('/:snippetId',  updateSnippet);
router.delete('/:snippetId', deleteSnippet);

export default router;
