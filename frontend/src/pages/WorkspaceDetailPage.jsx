import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell.jsx';
import RoleBadge from '../components/RoleBadge.jsx';
import { fetchWorkspace } from '../api/workspaceApi.js';

export default function WorkspaceDetailPage() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();

  const [workspace, setWorkspace] = useState(null);
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    fetchWorkspace(workspaceId)
      .then(({ data }) => {
        setWorkspace(data.workspace);
        setRole(data.role);
      })
      .catch((err) => {
        const status = err.response?.status;
        if (status === 403 || status === 404) {
          navigate('/workspaces', { replace: true });
        } else {
          setError(err.response?.data?.message || 'Failed to load workspace');
        }
      })
      .finally(() => setLoading(false));
  }, [workspaceId, navigate]);

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-32 text-gray-500 text-sm animate-pulse">
          Loading…
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto px-4 py-10">
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Back */}
        <button
          onClick={() => navigate('/workspaces')}
          className="text-sm text-gray-500 hover:text-white transition mb-6 flex items-center gap-1"
        >
          ← Back to workspaces
        </button>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-lg">
              {workspace.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-semibold">{workspace.name}</h1>
              {workspace.description && (
                <p className="text-gray-400 text-sm mt-0.5">{workspace.description}</p>
              )}
            </div>
          </div>
          <RoleBadge role={role} />
        </div>

        {/* Projects shortcut */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Projects
            </h2>
            <button
              onClick={() => navigate(`/workspaces/${workspaceId}/projects`)}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition"
            >
              View all →
            </button>
          </div>
          <div
            onClick={() => navigate(`/workspaces/${workspaceId}/projects`)}
            className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 cursor-pointer hover:border-indigo-500/40 transition text-sm text-gray-400 hover:text-white"
          >
            Browse and manage projects in this workspace →
          </div>
        </section>

        {/* Members */}
        <section>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Members · {workspace.members.length}
          </h2>
          <div className="bg-gray-900 border border-gray-800 rounded-xl divide-y divide-gray-800">
            {workspace.members.map((m) => (
              <div
                key={m.user._id}
                className="flex items-center justify-between px-5 py-3.5"
              >
                <div className="flex items-center gap-3">
                  {/* Avatar placeholder */}
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-300">
                    {m.user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{m.user.name}</p>
                    <p className="text-xs text-gray-500">{m.user.email}</p>
                  </div>
                </div>
                <RoleBadge role={m.role} />
              </div>
            ))}
          </div>
        </section>

        {/* Meta */}
        <div className="mt-6 text-xs text-gray-600 space-y-1">
          <p>Created {new Date(workspace.createdAt).toLocaleString()}</p>
          <p>Last updated {new Date(workspace.updatedAt).toLocaleString()}</p>
        </div>
      </div>
    </AppShell>
  );
}
