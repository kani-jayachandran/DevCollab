import mongoose from 'mongoose';

export const PROJECT_STATUS = Object.freeze({
  ACTIVE: 'active',
  ARCHIVED: 'archived',
});

const projectMemberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Inherits workspace role by default; can be overridden per-project later
    role: {
      type: String,
      enum: ['Owner', 'Admin', 'Member', 'Viewer'],
      default: 'Member',
    },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      default: '',
      maxlength: [500, 'Description cannot exceed 500 characters'],
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
    status: {
      type: String,
      enum: Object.values(PROJECT_STATUS),
      default: PROJECT_STATUS.ACTIVE,
    },
    members: {
      type: [projectMemberSchema],
      default: [],
    },
  },
  { timestamps: true }
);

// Compound index: fast lookup of all projects in a workspace
projectSchema.index({ workspace: 1, createdAt: -1 });

const Project = mongoose.model('Project', projectSchema);
export default Project;
