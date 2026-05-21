import { Router } from 'express';
import protect from '../middleware/authMiddleware.js';
import { loadWorkspace } from '../middleware/workspaceMiddleware.js';
import { loadProject } from '../middleware/projectMiddleware.js';
import {
  getDocs,
  createDoc,
  getDoc,
  updateDoc,
  deleteDoc,
} from '../controllers/docController.js';

/**
 * Nested under /api/workspaces/:workspaceId/projects/:projectId/docs
 * mergeParams: true gives access to both :workspaceId and :projectId.
 */
const router = Router({ mergeParams: true });

router.use(protect);
router.use(loadWorkspace);
router.use(loadProject);

// Collection
router.get('/',  getDocs);
router.post('/', createDoc);

// Single doc
router.get('/:docId',    getDoc);
router.patch('/:docId',  updateDoc);
router.delete('/:docId', deleteDoc);

export default router;
