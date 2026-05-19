import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useWorkspace } from '../context/WorkspaceContext.jsx';
import RoleBadge from './RoleBadge.jsx';

export default function WorkspaceCard({ workspace }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { removeWorkspace } = useWorkspace();

  // Derive the current user's role from the members array
  const membership = workspace.members.find(
    (m) => m.user._id === user?._id || m.user._id?.toString() === user?._id?.toString()
  );
  const role = membership?.role ?? 'Viewer';
  const isOwner = workspace.owner._id === user?._id ||
    workspace.owner._id?.toString() === user?._id?.toString();

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete workspace "${workspace.name}"? This cannot be undone.`)) return;
    try {
      await removeWorkspace(workspace._id);
    } catch {
      alert('Failed to delete workspace');
    }
  };

  return (
    <div
      onClick={() => navigate(`/workspaces/${workspace._id}`)}
      className="bg-gray-900 border border-gray-800 rounded-xl p-5 cursor-pointer hover:border-indigo-500/50 hover:bg-gray-900/80 transition group"
    >
      <div className="flex items-start justify-between gap-3">
        {/* Icon + name */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0 text-indigo-400 font-bold text-sm">
            {workspace.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="font-medium text-white truncate group-hover:text-indigo-300 transition">
              {workspace.name}
            </h3>
            {workspace.description && (
              <p className="text-xs text-gray-500 truncate mt-0.5">
                {workspace.description}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <RoleBadge role={role} />
          {isOwner && (
            <button
              onClick={handleDelete}
              className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition text-lg leading-none"
              aria-label="Delete workspace"
              title="Delete workspace"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
        <span>{workspace.members.length} member{workspace.members.length !== 1 ? 's' : ''}</span>
        <span>·</span>
        <span>Created {new Date(workspace.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}
