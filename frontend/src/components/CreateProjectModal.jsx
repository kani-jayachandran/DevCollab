import { useState } from 'react';
import { useProject } from '../context/ProjectContext.jsx';

export default function CreateProjectModal({ onClose, onCreated }) {
  const { addProject } = useProject();
  const [form, setForm]     = useState({ name: '', description: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) {
      setError('Project name is required');
      return;
    }
    setLoading(true);
    try {
      const project = await addProject(form);
      onCreated?.(project);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold">New project</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="proj-name" className="block text-sm text-gray-300 mb-1.5">
              Name <span className="text-red-400">*</span>
            </label>
            <input
              id="proj-name"
              name="name"
              type="text"
              required
              autoFocus
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Website Redesign"
              maxLength={100}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label htmlFor="proj-desc" className="block text-sm text-gray-300 mb-1.5">
              Description
              <span className="text-gray-500 ml-1 font-normal">(optional)</span>
            </label>
            <textarea
              id="proj-desc"
              name="description"
              rows={3}
              value={form.description}
              onChange={handleChange}
              placeholder="What is this project about?"
              maxLength={500}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
            />
          </div>

          <div className="flex gap-3 pt-1">
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
              {loading ? 'Creating…' : 'Create project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
