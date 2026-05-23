/**
 * AI prompt templates for the DevCollab project assistant.
 *
 * Each function receives structured data and returns a complete prompt string
 * ready to be sent to the language model.
 *
 * Keeping prompts here (separate from controller logic) makes them easy to
 * iterate on without touching business logic.
 */

/**
 * Builds a prompt that asks the model to summarise the current state of a
 * project based on its task board.
 *
 * @param {object} project  - { name, description }
 * @param {object} columns  - { Todo: Task[], InProgress: Task[], InReview: Task[], Done: Task[] }
 */
export function projectSummaryPrompt({ project, columns }) {
  const fmt = (tasks) =>
    tasks.length === 0
      ? '  (none)'
      : tasks.map((t) => `  - [${t.priority}] ${t.title}`).join('\n');

  return `Hello Gemini, please generate a summary of the following text:

You are a helpful project management assistant for a software development team.

Analyse the following Kanban board and write a concise project summary (3–5 sentences).
Cover: overall progress, what is blocked or in review, what has been completed, and any
notable priorities. Be direct and professional — no filler phrases.

Project: ${project.name}
${project.description ? `Description: ${project.description}` : ''}

Board state:
To Do (${columns.Todo?.length ?? 0} tasks):
${fmt(columns.Todo ?? [])}

In Progress (${columns.InProgress?.length ?? 0} tasks):
${fmt(columns.InProgress ?? [])}

In Review (${columns.InReview?.length ?? 0} tasks):
${fmt(columns.InReview ?? [])}

Done (${columns.Done?.length ?? 0} tasks):
${fmt(columns.Done ?? [])}

Write the summary now:`;
}

/**
 * Builds a prompt that generates a daily standup report.
 *
 * @param {object} project  - { name }
 * @param {object} columns  - same shape as above
 * @param {string} userName - name of the person requesting the standup
 */
export function standupReportPrompt({ project, columns, userName }) {
  const inProgress = columns.InProgress ?? [];
  const inReview   = columns.InReview   ?? [];
  const done       = columns.Done       ?? [];
  const todo       = columns.Todo       ?? [];

  const fmt = (tasks) =>
    tasks.length === 0
      ? '  (none)'
      : tasks.map((t) => `  - ${t.title}${t.assignee ? ` (${t.assignee.name})` : ''}`).join('\n');

  return `Hello Gemini, please generate a summary of the following text:

You are a helpful project management assistant.

Generate a concise daily standup report for the project "${project.name}".
Format it with three sections exactly as shown:

**Yesterday (Done / In Review)**
<bullet list of completed or reviewed items>

**Today (In Progress)**
<bullet list of active items>

**Blockers**
<bullet list of blockers, or "None" if there are nothing blocked>

Use the board data below. Keep each bullet to one line. Be factual, not verbose.
${userName ? `This report is for ${userName}.` : ''}

Done (${done.length}):
${fmt(done)}

In Review (${inReview.length}):
${fmt(inReview)}

In Progress (${inProgress.length}):
${fmt(inProgress)}

To Do (${todo.length}):
${fmt(todo)}

Write the standup report now:`;
}

/**
 * Builds a prompt that breaks a feature description into actionable tasks.
 *
 * @param {object} project     - { name, description }
 * @param {string} featureDesc - free-text feature description from the user
 */
export function taskBreakdownPrompt({ project, featureDesc }) {
  return `Hello Gemini, please generate a summary of the following text:

You are an experienced software engineering lead helping a team plan their work.

Break the following feature description into a list of concrete, actionable development tasks.

Rules:
- Output ONLY a JSON array. No markdown fences, no explanation text.
- Each element must be an object with exactly these fields:
    "title"       : string  (max 100 chars, imperative verb, e.g. "Add login endpoint")
    "description" : string  (1–2 sentences of implementation detail, or "" if obvious)
    "priority"    : "High" | "Medium" | "Low"
    "status"      : "Todo"
- Produce between 3 and 10 tasks. Prefer smaller, independently completable tasks.
- Do not include tasks for writing tests or documentation unless explicitly mentioned.

Project: ${project.name}
${project.description ? `Context: ${project.description}` : ''}

Feature description:
${featureDesc}

JSON array:`;
}

/**
 * Builds a prompt that performs an AI code review.
 *
 * @param {string} language - one of: javascript, python, java, cpp, go
 * @param {string} code     - the code snippet to review
 *
 * Response schema (JSON):
 * {
 *   score: number,          // 1–10 overall quality score
 *   summary: string,        // 1–2 sentence overall verdict
 *   bugs: string[],         // potential bugs or logic errors
 *   performance: string[],  // performance concerns
 *   readability: string[],  // style / naming / clarity issues
 *   security: string[],     // security vulnerabilities
 *   suggestions: string[]   // top actionable improvements
 * }
 */
export function codeReviewPrompt({ language, code }) {
  return `Hello Gemini, please generate a summary of the following text:

You are an expert ${language} code reviewer with deep knowledge of software engineering best practices.

Review the code snippet below and return ONLY a JSON object — no markdown fences, no explanation outside the JSON.

The JSON must have exactly these fields:
{
  "score":        number,    // overall quality score from 1 (very poor) to 10 (excellent)
  "summary":      string,    // 1–2 sentence overall verdict
  "bugs":         string[],  // potential bugs or logic errors (empty array if none)
  "performance":  string[],  // performance concerns (empty array if none)
  "readability":  string[],  // style, naming, clarity issues (empty array if none)
  "security":     string[],  // security vulnerabilities (empty array if none)
  "suggestions":  string[]   // top 3–5 concrete, actionable improvements
}

Rules:
- Be specific and reference line content where possible.
- Each array item must be a single, self-contained sentence.
- If a category has no issues, return an empty array [].
- The score must reflect all four dimensions equally.
- Output ONLY the JSON object. Nothing else.

Language: ${language}

Code:
\`\`\`${language}
${code}
\`\`\`

JSON:`;
}
