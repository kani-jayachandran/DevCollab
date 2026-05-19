import { Router } from 'express';
import protect from '../middleware/authMiddleware.js';
import { loadWorkspace, requireRole } from '../middleware/workspaceMiddleware.js';
import { ROLES } from '../models/Workspace.js';
import {
  createWorkspace,
  getMyWorkspaces,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
} from '../controllers/workspaceController.js';

const router = Router();

// All workspace routes require authentication
router.use(protect);

// Collection routes
router.post('/', createWorkspace);
router.get('/', getMyWorkspaces);

// Single-workspace routes — loadWorkspace verifies membership
router.get('/:workspaceId', loadWorkspace, getWorkspace);

router.patch(
  '/:workspaceId',
  loadWorkspace,
  requireRole(ROLES.OWNER, ROLES.ADMIN),
  updateWorkspace
);

router.delete(
  '/:workspaceId',
  loadWorkspace,
  requireRole(ROLES.OWNER),
  deleteWorkspace
);

export default router;
