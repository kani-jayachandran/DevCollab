import TaskCard from './TaskCard.jsx';
import { STATUS_LABELS } from '../context/TaskContext.jsx';

const COLUMN_ACCENT = {
  Todo:       'border-gray-700',
  InProgress: 'border-blue-500/40',
  InReview:   'border-yellow-500/40',
  Done:       'border-green-500/40',
};

const COLUMN_HEADER = {
  Todo:       'text-gray-400',
  InProgress: 'text-blue-400',
  InReview:   'text-yellow-400',
  Done:       'text-green-400',
};

const COLUMN_COUNT_BG = {
  Todo:       'bg-gray-700 text-gray-300',
  InProgress: 'bg-blue-500/20 text-blue-300',
  InReview:   'bg-yellow-500/20 text-yellow-300',
  Done:       'bg-green-500/20 text-green-300',
};

export default function KanbanColumn({ status, tasks, onAddTask, onEditTask }) {
  return (
    <div className={`flex flex-col bg-gray-950 border ${COLUMN_ACCENT[status]} rounded-xl min-w-[260px] w-[260px] shrink-0`}>
      {/* Column header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold uppercase tracking-wider ${COLUMN_HEADER[status]}`}>
            {STATUS_LABELS[status]}
          </span>
          <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${COLUMN_COUNT_BG[status]}`}>
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => onAddTask(status)}
          className="text-gray-600 hover:text-indigo-400 transition text-lg leading-none"
          aria-label={`Add task to ${STATUS_LABELS[status]}`}
          title="Add task"
        >
          +
        </button>
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 min-h-[120px]">
        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-20 text-xs text-gray-700 select-none">
            No tasks
          </div>
        )}
        {tasks.map((task) => (
          <TaskCard key={task._id} task={task} onEdit={onEditTask} />
        ))}
      </div>

      {/* Add task shortcut at bottom */}
      <button
        onClick={() => onAddTask(status)}
        className="mx-3 mb-3 mt-1 py-2 rounded-lg border border-dashed border-gray-800 text-xs text-gray-600 hover:text-gray-400 hover:border-gray-600 transition"
      >
        + Add task
      </button>
    </div>
  );
}
