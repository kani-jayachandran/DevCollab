import { useTask } from '../context/TaskContext.jsx';

const PRIORITY_DOT = {
  High:   'bg-red-400',
  Medium: 'bg-yellow-400',
  Low:    'bg-blue-400',
};

const PRIORITY_LABEL = {
  High:   'text-red-400',
  Medium: 'text-yellow-400',
  Low:    'text-blue-400',
};

export default function TaskCard({ task, onEdit }) {
  const { removeTask } = useTask();

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    try {
      await removeTask(task._id);
    } catch {
      alert('Failed to delete task');
    }
  };

  const isOverdue =
    task.dueDate && task.status !== 'Done' && new Date(task.dueDate) < new Date();

  return (
    <div
      onClick={() => onEdit(task)}
      className="bg-gray-900 border border-gray-800 rounded-lg p-3.5 cursor-pointer hover:border-indigo-500/40 transition group"
    >
      {/* Priority dot + title */}
      <div className="flex items-start gap-2">
        <span
          className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${PRIORITY_DOT[task.priority] ?? PRIORITY_DOT.Medium}`}
          title={task.priority}
        />
        <p className="text-sm text-white font-medium leading-snug flex-1 min-w-0 break-words">
          {task.title}
        </p>
        <button
          onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition text-base leading-none shrink-0 ml-1"
          aria-label="Delete task"
          title="Delete task"
        >
          ×
        </button>
      </div>

      {/* Description preview */}
      {task.description && (
        <p className="text-xs text-gray-500 mt-1.5 ml-4 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Footer meta */}
      <div className="mt-3 ml-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Assignee avatar */}
          {task.assignee ? (
            <div
              className="w-5 h-5 rounded-full bg-indigo-600/40 border border-indigo-500/40 flex items-center justify-center text-[10px] font-medium text-indigo-300"
              title={task.assignee.name}
            >
              {task.assignee.name?.charAt(0).toUpperCase()}
            </div>
          ) : (
            <div
              className="w-5 h-5 rounded-full bg-gray-700 border border-gray-600 flex items-center justify-center"
              title="Unassigned"
            >
              <span className="text-gray-500 text-[9px]">?</span>
            </div>
          )}

          {/* Priority label */}
          <span className={`text-[10px] font-medium ${PRIORITY_LABEL[task.priority] ?? PRIORITY_LABEL.Medium}`}>
            {task.priority}
          </span>
        </div>

        {/* Due date */}
        {task.dueDate && (
          <span className={`text-[10px] ${isOverdue ? 'text-red-400' : 'text-gray-500'}`}>
            {isOverdue ? '⚠ ' : ''}
            {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>
    </div>
  );
}
