import mongoose from 'mongoose';

/**
 * A single entry in the version history.
 * Stored as a subdocument array on the Doc — no separate collection needed.
 */
const versionSchema = new mongoose.Schema(
  {
    title:     { type: String, required: true },
    content:   { type: String, default: '' },  // HTML string from TipTap
    savedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    savedAt: { type: Date, default: Date.now },
    version: { type: Number, required: true },
  },
  { _id: true }
);

const docSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    content: {
      type: String,
      default: '',   // HTML string from TipTap
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
    lastEditedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    version: {
      type: Number,
      default: 1,
    },
    // Capped at 50 versions to keep the document size bounded
    history: {
      type: [versionSchema],
      default: [],
    },
  },
  { timestamps: true }
);

// Fast lookup: all docs in a project sorted by last update
docSchema.index({ project: 1, updatedAt: -1 });

const Doc = mongoose.model('Doc', docSchema);
export default Doc;
