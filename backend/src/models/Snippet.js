import mongoose from 'mongoose';

// Canonical list of supported languages (used for validation + UI dropdowns)
export const LANGUAGES = [
  'bash', 'c', 'cpp', 'css', 'diff', 'dockerfile',
  'go', 'graphql', 'html', 'java', 'javascript', 'json',
  'kotlin', 'markdown', 'nginx', 'php', 'plaintext',
  'python', 'ruby', 'rust', 'scss', 'shell', 'sql',
  'swift', 'toml', 'typescript', 'xml', 'yaml',
];

const snippetSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Snippet title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      default: '',
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    language: {
      type: String,
      required: [true, 'Language is required'],
      enum: { values: LANGUAGES, message: 'Unsupported language: {VALUE}' },
      default: 'plaintext',
    },
    code: {
      type: String,
      required: [true, 'Code is required'],
      maxlength: [50000, 'Code cannot exceed 50 000 characters'],
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 10,
        message: 'A snippet can have at most 10 tags',
      },
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Text index for full-text search on title + tags.
// language_override points to a non-existent field so MongoDB never
// confuses our `language` field (e.g. "html", "javascript") with its
// built-in per-document stemmer override, which would cause:
//   MongoServerError: language override unsupported: html / javascript
snippetSchema.index(
  { title: 'text', tags: 'text' },
  { language_override: '_textLanguage' }
);
// Fast lookup: all snippets in a project
snippetSchema.index({ project: 1, createdAt: -1 });

const Snippet = mongoose.model('Snippet', snippetSchema);
export default Snippet;
