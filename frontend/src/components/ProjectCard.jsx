import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useProject } from '../context/ProjectContext.jsx';

const STATUS_STYLES = {
  active:   'bg-green-500/15 text-green-400 border-green-500/30',
  archived: 'bg-gray-500/15  text-gray-400  border-gray-500/30',
};

export default function ProjectCard({ project, workspaceId }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { removeProject } = useProject();

  const isCreator =
    project.createdBy?._id === user?._id ||
    project.createdBy?._id?.toString() === user?._id?.toString();

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete project "${project.name}"? This cannot be undone.`)) return;
    try {
      await removeProject(project._id);
    } catch {
      alert('Failed to delete project');
    }
  };

  return (
    <div
      onClick={() => navigate(`/workspaces/${workspaceId}/projects/${project._id}`)}
      className="bg-gray-900 border border-gray-800 rounded-xl p-5 cursor-pointer hover:border-indigo-500/50 hover:bg-gray-900/80 transition group"
    >
      <div className="flex items-start justify-between gap-3">
        {/* Icon + name */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center shrink-0 text-violet-400 font-bold text-sm">
            {project.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="font-medium text-white truncate group-hover:text-indigo-300 transition">
              {project.name}
            </h3>
            {project.description && (
              <p className="text-xs text-gray-500 truncate mt-0.5">
                {project.description}
              </p>
            )}
          </div>
        </div>

        {/* Status badge + delete */}
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
              STATUS_STYLES[project.status] ?? STATUS_STYLES.active
            }`}
          >
            {project.status}
          </span>
          {isCreator && (
            <button
              onClick={handleDelete}
              className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition text-lg leading-none"
              aria-label="Delete project"
              title="Delete project"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
        <span>{project.members.length} member{project.members.length !== 1 ? 's' : ''}</span>
        <span>·</span>
        <span>by {project.createdBy?.name ?? '—'}</span>
        <span>·</span>
        <span>{new Date(project.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}
