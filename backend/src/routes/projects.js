import { Router } from 'express';
import protect from '../middleware/authMiddleware.js';
import { loadWorkspace, requireRole } from '../middleware/workspaceMiddleware.js';
import { ROLES } from '../models/Workspace.js';
import {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
} from '../controllers/projectController.js';

/**
 * All project routes are nested under /api/workspaces/:workspaceId/projects.
 * mergeParams: true lets us access :workspaceId from the parent router.
 */
const router = Router({ mergeParams: true });

// Every request must be authenticated and the user must be a workspace member
router.use(protect);
router.use(loadWorkspace);

// Collection
router.get('/', getProjects);
router.post('/', requireRole(ROLES.OWNER, ROLES.ADMIN, ROLES.MEMBER), createProject);

// Single project
router.get('/:projectId', getProject);
router.patch('/:projectId', requireRole(ROLES.OWNER, ROLES.ADMIN), updateProject);
router.delete('/:projectId', requireRole(ROLES.OWNER), deleteProject);

export default router;
