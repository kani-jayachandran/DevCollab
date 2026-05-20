import Project from '../models/Project.js';

/**
 * Loads the project by :projectId param and verifies it belongs to req.workspace.
 * Attaches req.project. Must run after loadWorkspace (so req.workspace is set).
 */
export const loadProject = async (req, res, next) => {
  try {
    const project = await Project.findOne({
      _id: req.params.projectId,
      workspace: req.workspace._id,
    })
      .populate('createdBy', 'name email avatar')
      .populate('members.user', 'name email avatar');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    req.project = project;
    next();
  } catch (err) {
    next(err);
  }
};
