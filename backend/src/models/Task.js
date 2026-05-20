import mongoose from 'mongoose';

export const TASK_STATUS = Object.freeze({
  TODO:        'Todo',
  IN_PROGRESS: 'InProgress',
  IN_REVIEW:   'InReview',
  DONE:        'Done',
});

export const TASK_PRIORITY = Object.freeze({
  LOW:    'Low',
  MEDIUM: 'Medium',
  HIGH:   'High',
});

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      default: '',
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    status: {
      type: String,
      enum: Object.values(TASK_STATUS),
      default: TASK_STATUS.TODO,
    },
    priority: {
      type: String,
      enum: Object.values(TASK_PRIORITY),
      default: TASK_PRIORITY.MEDIUM,
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
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Fast lookup: all tasks in a project, sorted by status then order
taskSchema.index({ project: 1, status: 1, order: 1 });

const Task = mongoose.model('Task', taskSchema);
export default Task;
