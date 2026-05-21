import Doc from '../models/Doc.js';

const MAX_HISTORY = 50;

const POPULATE_CREATED_BY    = { path: 'createdBy',    select: 'name email avatar' };
const POPULATE_LAST_EDITED   = { path: 'lastEditedBy', select: 'name email avatar' };
const POPULATE_HISTORY_SAVED = { path: 'history.savedBy', select: 'name email avatar' };

/**
 * GET /api/workspaces/:workspaceId/projects/:projectId/docs
 * Lists all docs in the project (title + meta only, no content).
 */
export const getDocs = async (req, res) => {
  try {
    const docs = await Doc.find({ project: req.project._id })
      .select('-content -history')
      .populate(POPULATE_CREATED_BY)
      .populate(POPULATE_LAST_EDITED)
      .sort({ updatedAt: -1 });

    return res.status(200).json({ docs });
  } catch (err) {
    console.error('getDocs error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * POST /api/workspaces/:workspaceId/projects/:projectId/docs
 * Creates a new doc. Any workspace member can create.
 */
export const createDoc = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Document title is required' });
    }

    const doc = await Doc.create({
      title:       title.trim(),
      content:     content ?? '',
      project:     req.project._id,
      workspace:   req.workspace._id,
      createdBy:   req.user._id,
      lastEditedBy: req.user._id,
      version:     1,
      history: [{
        title:   title.trim(),
        content: content ?? '',
        savedBy: req.user._id,
        savedAt: new Date(),
        version: 1,
      }],
    });

    await doc.populate([POPULATE_CREATED_BY, POPULATE_LAST_EDITED]);

    return res.status(201).json({ doc });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    console.error('createDoc error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * GET /api/workspaces/:workspaceId/projects/:projectId/docs/:docId
 * Returns a single doc with full content and history.
 */
export const getDoc = async (req, res) => {
  try {
    const doc = await Doc.findOne({
      _id:     req.params.docId,
      project: req.project._id,
    })
      .populate(POPULATE_CREATED_BY)
      .populate(POPULATE_LAST_EDITED)
      .populate(POPULATE_HISTORY_SAVED);

    if (!doc) return res.status(404).json({ message: 'Document not found' });

    return res.status(200).json({ doc });
  } catch (err) {
    console.error('getDoc error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * PATCH /api/workspaces/:workspaceId/projects/:projectId/docs/:docId
 * Saves a new version of the doc. Any workspace member can edit.
 * Always appends to history (capped at MAX_HISTORY).
 */
export const updateDoc = async (req, res) => {
  try {
    const doc = await Doc.findOne({
      _id:     req.params.docId,
      project: req.project._id,
    });

    if (!doc) return res.status(404).json({ message: 'Document not found' });

    const { title, content } = req.body;

    // Only save a new version if something actually changed
    const titleChanged   = title   !== undefined && title.trim()  !== doc.title;
    const contentChanged = content !== undefined && content        !== doc.content;

    if (titleChanged)   doc.title   = title.trim();
    if (contentChanged) doc.content = content;

    if (titleChanged || contentChanged) {
      doc.version      += 1;
      doc.lastEditedBy  = req.user._id;

      // Append version snapshot
      doc.history.push({
        title:   doc.title,
        content: doc.content,
        savedBy: req.user._id,
        savedAt: new Date(),
        version: doc.version,
      });

      // Cap history length
      if (doc.history.length > MAX_HISTORY) {
        doc.history = doc.history.slice(-MAX_HISTORY);
      }
    }

    await doc.save();
    await doc.populate([POPULATE_CREATED_BY, POPULATE_LAST_EDITED, POPULATE_HISTORY_SAVED]);

    return res.status(200).json({ doc });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    console.error('updateDoc error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * DELETE /api/workspaces/:workspaceId/projects/:projectId/docs/:docId
 * Deletes a doc. Creator or Owner/Admin only.
 */
export const deleteDoc = async (req, res) => {
  try {
    const doc = await Doc.findOne({
      _id:     req.params.docId,
      project: req.project._id,
    });

    if (!doc) return res.status(404).json({ message: 'Document not found' });

    const isCreator    = doc.createdBy.toString() === req.user._id.toString();
    const isPrivileged = ['Owner', 'Admin'].includes(req.memberRole);

    if (!isCreator && !isPrivileged) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    await doc.deleteOne();
    return res.status(200).json({ message: 'Document deleted' });
  } catch (err) {
    console.error('deleteDoc error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
