import Project from '../models/Project.js';
import { ROLES } from '../models/Workspace.js';

const POPULATE_CREATED_BY = { path: 'createdBy', select: 'name email avatar' };
const POPULATE_MEMBERS    = { path: 'members.user', select: 'name email avatar' };

/**
 * POST /api/workspaces/:workspaceId/projects
 * Creates a project inside the workspace.
 * Restricted to Owner and Admin (enforced via requireRole in the router).
 */
export const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Project name is required' });
    }

    const project = await Project.create({
      name: name.trim(),
      description: description?.trim() || '',
      workspace: req.workspace._id,
      createdBy: req.user._id,
      // Creator is automatically added as a project member with Owner role
      members: [{ user: req.user._id, role: ROLES.OWNER }],
    });

    await project.populate([POPULATE_CREATED_BY, POPULATE_MEMBERS]);

    return res.status(201).json({ project });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    console.error('createProject error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * GET /api/workspaces/:workspaceId/projects
 * Lists all projects in the workspace.
 * Any workspace member can view.
 */
export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ workspace: req.workspace._id })
      .populate(POPULATE_CREATED_BY)
      .populate(POPULATE_MEMBERS)
      .sort({ createdAt: -1 });

    return res.status(200).json({ projects });
  } catch (err) {
    console.error('getProjects error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * GET /api/workspaces/:workspaceId/projects/:projectId
 * Returns a single project. Any workspace member can view.
 */
export const getProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.projectId,
      workspace: req.workspace._id,
    })
      .populate(POPULATE_CREATED_BY)
      .populate(POPULATE_MEMBERS);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    return res.status(200).json({ project });
  } catch (err) {
    console.error('getProject error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * PATCH /api/workspaces/:workspaceId/projects/:projectId
 * Updates name, description, or status.
 * Restricted to Owner and Admin (enforced via requireRole in the router).
 */
export const updateProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.projectId,
      workspace: req.workspace._id,
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const { name, description, status } = req.body;
    if (name !== undefined)        project.name        = name.trim();
    if (description !== undefined) project.description = description.trim();
    if (status !== undefined)      project.status      = status;

    await project.save();
    await project.populate([POPULATE_CREATED_BY, POPULATE_MEMBERS]);

    return res.status(200).json({ project });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    console.error('updateProject error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * DELETE /api/workspaces/:workspaceId/projects/:projectId
 * Deletes a project. Restricted to Owner only.
 */
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.projectId,
      workspace: req.workspace._id,
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    return res.status(200).json({ message: 'Project deleted' });
  } catch (err) {
    console.error('deleteProject error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
