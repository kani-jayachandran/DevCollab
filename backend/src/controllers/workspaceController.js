import Workspace, { ROLES } from '../models/Workspace.js';

// Shared populate options
const POPULATE_OWNER = { path: 'owner', select: 'name email avatar' };
const POPULATE_MEMBERS = { path: 'members.user', select: 'name email avatar' };

/**
 * POST /api/workspaces
 * Creates a new workspace. The creator is automatically set as Owner.
 */
export const createWorkspace = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Workspace name is required' });
    }

    const workspace = await Workspace.create({
      name: name.trim(),
      description: description?.trim() || '',
      owner: req.user._id,
      // Owner is also added to members so role-based queries are simpler
      members: [{ user: req.user._id, role: ROLES.OWNER }],
    });

    await workspace.populate([POPULATE_OWNER, POPULATE_MEMBERS]);

    return res.status(201).json({ workspace });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    console.error('createWorkspace error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * GET /api/workspaces
 * Returns all workspaces the authenticated user belongs to (any role).
 */
export const getMyWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.find({
      'members.user': req.user._id,
    })
      .populate(POPULATE_OWNER)
      .populate(POPULATE_MEMBERS)
      .sort({ createdAt: -1 });

    return res.status(200).json({ workspaces });
  } catch (err) {
    console.error('getMyWorkspaces error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * GET /api/workspaces/:workspaceId
 * Returns a single workspace. Access already verified by loadWorkspace middleware.
 */
export const getWorkspace = async (req, res) => {
  return res.status(200).json({
    workspace: req.workspace,
    role: req.memberRole,
  });
};

/**
 * PATCH /api/workspaces/:workspaceId
 * Updates name / description. Restricted to Owner and Admin.
 */
export const updateWorkspace = async (req, res) => {
  try {
    const { name, description } = req.body;
    const workspace = req.workspace;

    if (name !== undefined) workspace.name = name.trim();
    if (description !== undefined) workspace.description = description.trim();

    await workspace.save();
    await workspace.populate([POPULATE_OWNER, POPULATE_MEMBERS]);

    return res.status(200).json({ workspace });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    console.error('updateWorkspace error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * DELETE /api/workspaces/:workspaceId
 * Deletes the workspace. Restricted to Owner only.
 */
export const deleteWorkspace = async (req, res) => {
  try {
    await req.workspace.deleteOne();
    return res.status(200).json({ message: 'Workspace deleted' });
  } catch (err) {
    console.error('deleteWorkspace error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
