import Task from '../models/Task.js';
import { generateText, generateJSON } from '../ai/geminiService.js';
import {
  projectSummaryPrompt,
  standupReportPrompt,
  taskBreakdownPrompt,
} from '../ai/prompts.js';

// ── Shared helper: load tasks and group into columns ─────────────────────────
async function loadColumns(projectId) {
  const tasks = await Task.find({ project: projectId })
    .populate('assignee', 'name')
    .sort({ order: 1, createdAt: 1 });

  return {
    tasks,
    columns: {
      Todo:       tasks.filter((t) => t.status === 'Todo'),
      InProgress: tasks.filter((t) => t.status === 'InProgress'),
      InReview:   tasks.filter((t) => t.status === 'InReview'),
      Done:       tasks.filter((t) => t.status === 'Done'),
    },
  };
}

/**
 * POST /api/workspaces/:workspaceId/projects/:projectId/ai/summary
 * Generates a project summary from the current board state.
 */
export const generateSummary = async (req, res) => {
  try {
    const { columns } = await loadColumns(req.project._id);
    const prompt = projectSummaryPrompt({ project: req.project, columns });
    const summary = await generateText(prompt);
    return res.status(200).json({ summary: summary.trim() });
  } catch (err) {
    console.error('generateSummary error:', err.message);
    const isConfig = err.message.includes('GEMINI_API_KEY');
    return res.status(isConfig ? 503 : 500).json({ message: err.message });
  }
};

/**
 * POST /api/workspaces/:workspaceId/projects/:projectId/ai/standup
 * Generates a daily standup report.
 */
export const generateStandup = async (req, res) => {
  try {
    const { columns } = await loadColumns(req.project._id);
    const prompt = standupReportPrompt({
      project:  req.project,
      columns,
      userName: req.user.name,
    });
    const report = await generateText(prompt);
    return res.status(200).json({ report: report.trim() });
  } catch (err) {
    console.error('generateStandup error:', err.message);
    const isConfig = err.message.includes('GEMINI_API_KEY');
    return res.status(isConfig ? 503 : 500).json({ message: err.message });
  }
};

/**
 * POST /api/workspaces/:workspaceId/projects/:projectId/ai/breakdown
 * Body: { featureDescription: string }
 * Returns an array of task objects ready to be created on the board.
 */
export const generateBreakdown = async (req, res) => {
  try {
    const { featureDescription } = req.body;

    if (!featureDescription || !featureDescription.trim()) {
      return res.status(400).json({ message: 'featureDescription is required' });
    }

    const prompt = taskBreakdownPrompt({
      project:     req.project,
      featureDesc: featureDescription.trim(),
    });

    const tasks = await generateJSON(prompt);

    // Validate the shape — reject if the model returned something unexpected
    if (!Array.isArray(tasks)) {
      throw new Error('AI returned an unexpected format');
    }

    const validated = tasks.map((t) => ({
      title:       String(t.title       ?? '').slice(0, 100),
      description: String(t.description ?? ''),
      priority:    ['High', 'Medium', 'Low'].includes(t.priority) ? t.priority : 'Medium',
      status:      'Todo',
    }));

    return res.status(200).json({ tasks: validated });
  } catch (err) {
    console.error('generateBreakdown error:', err.message);
    const isConfig = err.message.includes('GEMINI_API_KEY');
    return res.status(isConfig ? 503 : 500).json({ message: err.message });
  }
};
