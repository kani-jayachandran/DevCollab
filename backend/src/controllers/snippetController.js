import Snippet from '../models/Snippet.js';

const POPULATE_CREATED_BY = { path: 'createdBy', select: 'name email avatar' };

/**
 * GET /api/workspaces/:workspaceId/projects/:projectId/snippets
 * Supports optional query params:
 *   ?q=<text>      — search title / tags (case-insensitive substring)
 *   ?tag=<tag>     — filter by exact tag
 *   ?lang=<lang>   — filter by language
 */
export const getSnippets = async (req, res) => {
  try {
    const { q, tag, lang } = req.query;
    const filter = { project: req.project._id };

    if (lang) filter.language = lang;
    if (tag)  filter.tags = tag;           // exact tag match

    // Substring search on title or tags
    if (q) {
      const re = new RegExp(q.trim(), 'i');
      filter.$or = [{ title: re }, { tags: re }];
    }

    const snippets = await Snippet.find(filter)
      .populate(POPULATE_CREATED_BY)
      .sort({ createdAt: -1 });

    return res.status(200).json({ snippets });
  } catch (err) {
    console.error('getSnippets error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * POST /api/workspaces/:workspaceId/projects/:projectId/snippets
 * Any workspace member can create.
 */
export const createSnippet = async (req, res) => {
  try {
    const { title, description, language, code, tags } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Snippet title is required' });
    }
    if (!code || !code.trim()) {
      return res.status(400).json({ message: 'Code is required' });
    }

    // Normalise tags: trim, lowercase, deduplicate, max 10
    const normTags = [...new Set(
      (Array.isArray(tags) ? tags : [])
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean)
    )].slice(0, 10);

    const snippet = await Snippet.create({
      title:       title.trim(),
      description: description?.trim() || '',
      language:    language || 'plaintext',
      code,
      tags:        normTags,
      project:     req.project._id,
      workspace:   req.workspace._id,
      createdBy:   req.user._id,
    });

    await snippet.populate(POPULATE_CREATED_BY);
    return res.status(201).json({ snippet });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    console.error('createSnippet error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * GET /api/workspaces/:workspaceId/projects/:projectId/snippets/:snippetId
 */
export const getSnippet = async (req, res) => {
  try {
    const snippet = await Snippet.findOne({
      _id:     req.params.snippetId,
      project: req.project._id,
    }).populate(POPULATE_CREATED_BY);

    if (!snippet) return res.status(404).json({ message: 'Snippet not found' });
    return res.status(200).json({ snippet });
  } catch (err) {
    console.error('getSnippet error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * PATCH /api/workspaces/:workspaceId/projects/:projectId/snippets/:snippetId
 * Creator or Owner/Admin can update.
 */
export const updateSnippet = async (req, res) => {
  try {
    const snippet = await Snippet.findOne({
      _id:     req.params.snippetId,
      project: req.project._id,
    });

    if (!snippet) return res.status(404).json({ message: 'Snippet not found' });

    const isCreator    = snippet.createdBy.toString() === req.user._id.toString();
    const isPrivileged = ['Owner', 'Admin'].includes(req.memberRole);
    if (!isCreator && !isPrivileged) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    const { title, description, language, code, tags } = req.body;

    if (title       !== undefined) snippet.title       = title.trim();
    if (description !== undefined) snippet.description = description.trim();
    if (language    !== undefined) snippet.language    = language;
    if (code        !== undefined) snippet.code        = code;
    if (tags        !== undefined) {
      snippet.tags = [...new Set(
        (Array.isArray(tags) ? tags : [])
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean)
      )].slice(0, 10);
    }

    await snippet.save();
    await snippet.populate(POPULATE_CREATED_BY);
    return res.status(200).json({ snippet });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    console.error('updateSnippet error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * DELETE /api/workspaces/:workspaceId/projects/:projectId/snippets/:snippetId
 * Creator or Owner/Admin can delete.
 */
export const deleteSnippet = async (req, res) => {
  try {
    const snippet = await Snippet.findOne({
      _id:     req.params.snippetId,
      project: req.project._id,
    });

    if (!snippet) return res.status(404).json({ message: 'Snippet not found' });

    const isCreator    = snippet.createdBy.toString() === req.user._id.toString();
    const isPrivileged = ['Owner', 'Admin'].includes(req.memberRole);
    if (!isCreator && !isPrivileged) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    await snippet.deleteOne();
    return res.status(200).json({ message: 'Snippet deleted' });
  } catch (err) {
    console.error('deleteSnippet error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
