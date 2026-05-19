import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell.jsx';
import RoleBadge from '../components/RoleBadge.jsx';
import { fetchProject } from '../api/projectApi.js';
import { fetchWorkspace } from '../api/workspaceApi.js';

const STATUS_STYLES = {
  active:   'bg-green-500/15 text-green-400 border-green-500/30',
  archived: 'bg-gray-500/15  text-gray-400  border-gray-500/30',
};

export default function ProjectDetailPage() {
  const { workspaceId, projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject]     = useState(null);
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  useEffect(() => {
    Promise.all([
      fetchWorkspace(workspaceId),
      fetchProject(workspaceId, projectId),
    ])
      .then(([wsRes, projRes]) => {
        setWorkspace(wsRes.data.workspace);
        setProject(projRes.data.project);
      })
      .catch((err) => {
        const status = err.response?.status;
        if (status === 403 || status === 404) {
          navigate(`/workspaces/${workspaceId}/projects`, { replace: true });
        } else {
          setError(err.response?.data?.message || 'Failed to load project');
        }
      })
      .finally(() => setLoading(false));
  }, [workspaceId, projectId, navigate]);

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
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-500 mb-6 flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => navigate('/workspaces')}
            className="hover:text-white transition"
          >
            Workspaces
          </button>
          <span>/</span>
          <button
            onClick={() => navigate(`/workspaces/${workspaceId}`)}
            className="hover:text-white transition"
          >
            {workspace?.name}
          </button>
          <span>/</span>
          <button
            onClick={() => navigate(`/workspaces/${workspaceId}/projects`)}
            className="hover:text-white transition"
          >
            Projects
          </button>
          <span>/</span>
          <span className="text-white">{project.name}</span>
        </nav>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 font-bold text-lg">
              {project.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-semibold">{project.name}</h1>
              {project.description && (
                <p className="text-gray-400 text-sm mt-0.5">{project.description}</p>
              )}
            </div>
          </div>
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${
              STATUS_STYLES[project.status] ?? STATUS_STYLES.active
            }`}
          >
            {project.status}
          </span>
        </div>

        {/* Members */}
        <section className="mb-8">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Members · {project.members.length}
          </h2>
          <div className="bg-gray-900 border border-gray-800 rounded-xl divide-y divide-gray-800">
            {project.members.map((m) => (
              <div
                key={m.user._id}
                className="flex items-center justify-between px-5 py-3.5"
              >
                <div className="flex items-center gap-3">
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

        {/* Tasks placeholder */}
        <section>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Tasks
          </h2>
          <div className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-10 text-center">
            <p className="text-gray-600 text-sm">Tasks coming soon.</p>
          </div>
        </section>

        {/* Meta */}
        <div className="mt-6 text-xs text-gray-600 space-y-1">
          <p>Created by {project.createdBy?.name} · {new Date(project.createdAt).toLocaleString()}</p>
          <p>Last updated {new Date(project.updatedAt).toLocaleString()}</p>
        </div>
      </div>
    </AppShell>
  );
}
