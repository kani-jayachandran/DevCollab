import { useState, useEffect } from 'react';
import { useTask, TASK_STATUSES, STATUS_LABELS } from '../context/TaskContext.jsx';

const PRIORITIES = ['Low', 'Medium', 'High'];

const PRIORITY_STYLES = {
  Low:    'text-blue-400',
  Medium: 'text-yellow-400',
  High:   'text-red-400',
};

// task prop = null → create mode; task prop = object → edit mode
export default function TaskModal({ task = null, defaultStatus = 'Todo', members = [], onClose }) {
  const { addTask, editTask } = useTask();
  const isEdit = Boolean(task);

  const [form, setForm] = useState({
    title:       task?.title       ?? '',
    description: task?.description ?? '',
    status:      task?.status      ?? defaultStatus,
    priority:    task?.priority    ?? 'Medium',
    assignee:    task?.assignee?._id ?? task?.assignee ?? '',
    dueDate:     task?.dueDate ? task.dueDate.slice(0, 10) : '',
  });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  // Keep form in sync if task prop changes (e.g. re-opening modal)
  useEffect(() => {
    if (task) {
      setForm({
        title:       task.title       ?? '',
        description: task.description ?? '',
        status:      task.status      ?? 'Todo',
        priority:    task.priority    ?? 'Medium',
        assignee:    task.assignee?._id ?? task.assignee ?? '',
        dueDate:     task.dueDate ? task.dueDate.slice(0, 10) : '',
      });
    }
  }, [task]);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.title.trim()) {
      setError('Title is required');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        assignee: form.assignee || null,
        dueDate:  form.dueDate  || null,
      };
      if (isEdit) {
        await editTask(task._id, payload);
      } else {
        await addTask(payload);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg bg-gray-900 border border-gray-800 rounded-xl shadow-xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 shrink-0">
          <h2 className="text-base font-semibold">
            {isEdit ? 'Edit task' : 'New task'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto">
          <div className="px-6 py-5 space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            {/* Title */}
            <div>
              <label htmlFor="task-title" className="block text-sm text-gray-300 mb-1.5">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                id="task-title"
                name="title"
                type="text"
                required
                autoFocus
                value={form.title}
                onChange={handleChange}
                placeholder="What needs to be done?"
                maxLength={150}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="task-desc" className="block text-sm text-gray-300 mb-1.5">
                Description
                <span className="text-gray-500 ml-1 font-normal">(optional)</span>
              </label>
              <textarea
                id="task-desc"
                name="description"
                rows={3}
                value={form.description}
                onChange={handleChange}
                placeholder="Add more details…"
                maxLength={2000}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
              />
            </div>

            {/* Status + Priority row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="task-status" className="block text-sm text-gray-300 mb-1.5">
                  Status
                </label>
                <select
                  id="task-status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                >
                  {TASK_STATUSES.map((s) => (
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="task-priority" className="block text-sm text-gray-300 mb-1.5">
                  Priority
                </label>
                <select
                  id="task-priority"
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Assignee + Due date row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="task-assignee" className="block text-sm text-gray-300 mb-1.5">
                  Assignee
                </label>
                <select
                  id="task-assignee"
                  name="assignee"
                  value={form.assignee}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                >
                  <option value="">Unassigned</option>
                  {members.map((m) => (
                    <option key={m.user._id} value={m.user._id}>
                      {m.user.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="task-due" className="block text-sm text-gray-300 mb-1.5">
                  Due date
                </label>
                <input
                  id="task-due"
                  name="dueDate"
                  type="date"
                  value={form.dueDate}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-800 flex gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-2.5 rounded-lg text-sm transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg text-sm transition"
            >
              {loading ? 'Saving…' : isEdit ? 'Save changes' : 'Create task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
