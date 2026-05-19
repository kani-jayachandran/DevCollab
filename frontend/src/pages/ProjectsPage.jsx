import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import CreateProjectModal from '../components/CreateProjectModal.jsx';
import RoleBadge from '../components/RoleBadge.jsx';
import { ProjectProvider, useProject } from '../context/ProjectContext.jsx';
import { fetchWorkspace } from '../api/workspaceApi.js';

// Inner component — has access to ProjectContext
function ProjectsContent({ workspace, role }) {
  const { workspaceId } = useParams();
  const { projects, loading, error, loadProjects } = useProject();
  const [showModal, setShowModal] = useState(false);

  // Only Owner, Admin, Member can create projects
  const canCreate = ['Owner', 'Admin', 'Member'].includes(role);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-500 mb-6 flex items-center gap-1.5">
          <button
            onClick={() => history.back()}
            className="hover:text-white transition"
          >
            Workspaces
          </button>
          <span>/</span>
          <span className="text-gray-300">{workspace.name}</span>
          <span>/</span>
          <span className="text-white">Projects</span>
        </nav>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-semibold">Projects</h1>
              <RoleBadge role={role} />
            </div>
            <p className="text-gray-400 text-sm">
              All projects in <span className="text-white">{workspace.name}</span>
            </p>
          </div>
          {canCreate && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
            >
              + New project
            </button>
          )}
        </div>

        {/* States */}
        {loading && (
          <div className="text-center py-20 text-gray-500 text-sm animate-pulse">
            Loading projects…
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {!loading && !error && projects.length === 0 && (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">📁</div>
            <p className="text-gray-400 text-sm">No projects yet.</p>
            {canCreate && (
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 text-indigo-400 hover:text-indigo-300 text-sm transition"
              >
                Create your first project →
              </button>
            )}
          </div>
        )}

        {!loading && !error && projects.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {projects.map((p) => (
              <ProjectCard key={p._id} project={p} workspaceId={workspaceId} />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <CreateProjectModal onClose={() => setShowModal(false)} />
      )}
    </AppShell>
  );
}

// Outer component — loads workspace, then provides ProjectContext
export default function ProjectsPage() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();

  const [workspace, setWorkspace] = useState(null);
  const [role, setRole]           = useState('');
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  useEffect(() => {
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
    <ProjectProvider workspaceId={workspaceId}>
      <ProjectsContent workspace={workspace} role={role} />
    </ProjectProvider>
  );
}
