import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell.jsx';
import KanbanColumn from '../components/KanbanColumn.jsx';
import TaskModal from '../components/TaskModal.jsx';
import RoleBadge from '../components/RoleBadge.jsx';
import { TaskProvider, useTask, TASK_STATUSES } from '../context/TaskContext.jsx';
import { fetchWorkspace } from '../api/workspaceApi.js';
import { fetchProject } from '../api/projectApi.js';

// ─── Inner board — has access to TaskContext ──────────────────────────────────
function KanbanBoard({ workspace, project, role }) {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const { loading, error, loadTasks, getColumns } = useTask();

  // Modal state: null = closed, { status } = create, { task } = edit
  const [modal, setModal] = useState(null);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const columns = getColumns();

  const openCreate = (status) => setModal({ status });
  const openEdit   = (task)   => setModal({ task });
  const closeModal = ()       => setModal(null);

  return (
    <AppShell>
      <div className="flex flex-col h-[calc(100vh-57px)]">
        {/* Page header */}
        <div className="px-6 py-4 border-b border-gray-800 shrink-0">
          {/* Breadcrumb */}
          <nav className="text-xs text-gray-500 mb-2 flex items-center gap-1.5 flex-wrap">
            <button onClick={() => navigate('/workspaces')} className="hover:text-white transition">
              Workspaces
            </button>
            <span>/</span>
            <button onClick={() => navigate(`/workspaces/${workspaceId}`)} className="hover:text-white transition">
              {workspace.name}
            </button>
            <span>/</span>
            <button onClick={() => navigate(`/workspaces/${workspaceId}/projects`)} className="hover:text-white transition">
              Projects
            </button>
            <span>/</span>
            <span className="text-white">{project.name}</span>
          </nav>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold">{project.name}</h1>
              <RoleBadge role={role} />
              {project.description && (
                <span className="text-sm text-gray-500 hidden md:block">
                  — {project.description}
                </span>
              )}
            </div>
            <button
              onClick={() => openCreate('Todo')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
            >
              + New task
            </button>
          </div>
        </div>

        {/* Board area */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          {loading && (
            <div className="flex items-center justify-center h-full text-gray-500 text-sm animate-pulse">
              Loading board…
            </div>
          )}

          {!loading && error && (
            <div className="m-6 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          {!loading && !error && (
            <div className="flex gap-4 p-6 h-full items-start">
              {TASK_STATUSES.map((status) => (
                <KanbanColumn
                  key={status}
                  status={status}
                  tasks={columns[status] ?? []}
                  onAddTask={openCreate}
                  onEditTask={openEdit}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Task modal */}
      {modal && (
        <TaskModal
          task={modal.task ?? null}
          defaultStatus={modal.status ?? 'Todo'}
          members={project.members ?? []}
          onClose={closeModal}
        />
      )}
    </AppShell>
  );
}

// ─── Outer page — loads workspace + project, then provides TaskContext ─────────
export default function KanbanPage() {
  const { workspaceId, projectId } = useParams();
  const navigate = useNavigate();

  const [workspace, setWorkspace] = useState(null);
  const [project,   setProject]   = useState(null);
  const [role,      setRole]      = useState('');
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');

  useEffect(() => {
    Promise.all([
      fetchWorkspace(workspaceId),
      fetchProject(workspaceId, projectId),
    ])
      .then(([wsRes, projRes]) => {
        setWorkspace(wsRes.data.workspace);
        setRole(wsRes.data.role);
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
    <TaskProvider workspaceId={workspaceId} projectId={projectId}>
      <KanbanBoard workspace={workspace} project={project} role={role} />
    </TaskProvider>
  );
}
