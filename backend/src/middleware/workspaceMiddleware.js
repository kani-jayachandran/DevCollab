import Workspace, { ROLES } from '../models/Workspace.js';

/**
 * Loads the workspace by :workspaceId param and attaches it to req.workspace.
 * Also attaches req.memberRole — the calling user's role in that workspace.
 * Returns 404 if not found, 403 if the user is not a member.
 */
export const loadWorkspace = async (req, res, next) => {
  try {
    const workspace = await Workspace.findById(req.params.workspaceId)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    const userId = req.user._id.toString();

    // Owner always has access
    if (workspace.owner._id.toString() === userId) {
      req.workspace = workspace;
      req.memberRole = ROLES.OWNER;
      return next();
    }

    const membership = workspace.members.find(
      (m) => m.user._id.toString() === userId
    );

    if (!membership) {
      return res.status(403).json({ message: 'Access denied' });
    }

    req.workspace = workspace;
    req.memberRole = membership.role;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Factory — restricts access to users whose role is in the allowedRoles list.
 * Must be used after loadWorkspace.
 */
export const requireRole = (...allowedRoles) =>
  (req, res, next) => {
    if (!allowedRoles.includes(req.memberRole)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
