import Task, { TASK_STATUS } from '../models/Task.js';
import { emitToProject, EVENTS } from '../socket/socketServer.js';

const POPULATE_ASSIGNEE   = { path: 'assignee',   select: 'name email avatar' };
const POPULATE_CREATED_BY = { path: 'createdBy',  select: 'name email avatar' };

/**
 * GET /api/workspaces/:workspaceId/projects/:projectId/tasks
 */
export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.project._id })
      .populate(POPULATE_ASSIGNEE)
      .populate(POPULATE_CREATED_BY)
      .sort({ order: 1, createdAt: 1 });

    const columns = Object.values(TASK_STATUS).reduce((acc, s) => {
      acc[s] = [];
      return acc;
    }, {});
    for (const task of tasks) {
      if (columns[task.status]) columns[task.status].push(task);
    }

    return res.status(200).json({ tasks, columns });
  } catch (err) {
    console.error('getTasks error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * POST /api/workspaces/:workspaceId/projects/:projectId/tasks
 */
export const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, assignee, dueDate } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Task title is required' });
    }

    const lastTask = await Task.findOne({
      project: req.project._id,
      status: status || TASK_STATUS.TODO,
    }).sort({ order: -1 });

    const order = lastTask ? lastTask.order + 1 : 0;

    const task = await Task.create({
      title: title.trim(),
      description: description?.trim() || '',
      status: status || TASK_STATUS.TODO,
      priority: priority || 'Medium',
      project: req.project._id,
      workspace: req.workspace._id,
      assignee: assignee || null,
      createdBy: req.user._id,
      dueDate: dueDate || null,
      order,
    });

    await task.populate([POPULATE_ASSIGNEE, POPULATE_CREATED_BY]);

    // ── Emit to all clients viewing this project ──────────────────────────
    emitToProject(req.project._id.toString(), EVENTS.TASK_CREATED, { task });

    return res.status(201).json({ task });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    console.error('createTask error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * GET /api/workspaces/:workspaceId/projects/:projectId/tasks/:taskId
 */
export const getTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.taskId,
      project: req.project._id,
    })
      .populate(POPULATE_ASSIGNEE)
      .populate(POPULATE_CREATED_BY);

    if (!task) return res.status(404).json({ message: 'Task not found' });
    return res.status(200).json({ task });
  } catch (err) {
    console.error('getTask error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * PATCH /api/workspaces/:workspaceId/projects/:projectId/tasks/:taskId
 */
export const updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.taskId,
      project: req.project._id,
    });

    if (!task) return res.status(404).json({ message: 'Task not found' });

    const prevStatus = task.status;
    const { title, description, status, priority, assignee, dueDate, order } = req.body;

    if (title       !== undefined) task.title       = title.trim();
    if (description !== undefined) task.description = description.trim();
    if (status      !== undefined) task.status      = status;
    if (priority    !== undefined) task.priority    = priority;
    if (assignee    !== undefined) task.assignee    = assignee || null;
    if (dueDate     !== undefined) task.dueDate     = dueDate  || null;
    if (order       !== undefined) task.order       = order;

    await task.save();
    await task.populate([POPULATE_ASSIGNEE, POPULATE_CREATED_BY]);

    // ── Emit: use task:moved when only status/order changed, task:updated otherwise
    const isMoveOnly =
      status !== undefined &&
      title === undefined &&
      description === undefined &&
      priority === undefined &&
      assignee === undefined &&
      dueDate === undefined;

    const event = isMoveOnly ? EVENTS.TASK_MOVED : EVENTS.TASK_UPDATED;
    emitToProject(req.project._id.toString(), event, {
      task,
      prevStatus: isMoveOnly ? prevStatus : undefined,
    });

    return res.status(200).json({ task });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    console.error('updateTask error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * DELETE /api/workspaces/:workspaceId/projects/:projectId/tasks/:taskId
 */
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.taskId,
      project: req.project._id,
    });

    if (!task) return res.status(404).json({ message: 'Task not found' });

    const isCreator    = task.createdBy.toString() === req.user._id.toString();
    const isPrivileged = ['Owner', 'Admin'].includes(req.memberRole);

    if (!isCreator && !isPrivileged) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    const taskId    = task._id.toString();
    const projectId = req.project._id.toString();

    await task.deleteOne();

    // ── Emit ──────────────────────────────────────────────────────────────
    emitToProject(projectId, EVENTS.TASK_DELETED, { taskId });

    return res.status(200).json({ message: 'Task deleted' });
  } catch (err) {
    console.error('deleteTask error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
