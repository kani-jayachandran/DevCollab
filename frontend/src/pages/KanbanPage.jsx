import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

import AppShell from '../components/AppShell.jsx';
import KanbanColumn from '../components/KanbanColumn.jsx';
import TaskCard from '../components/TaskCard.jsx';
import TaskModal from '../components/TaskModal.jsx';
import RoleBadge from '../components/RoleBadge.jsx';
import PresenceBar from '../components/PresenceBar.jsx';
import { TaskProvider, useTask, TASK_STATUSES } from '../context/TaskContext.jsx';
import { usePresence } from '../hooks/usePresence.js';
import { fetchWorkspace } from '../api/workspaceApi.js';
import { fetchProject } from '../api/projectApi.js';

// ─── Inner board — has access to TaskContext ──────────────────────────────────
function KanbanBoard({ workspace, project, role }) {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const { tasks, loading, error, loadTasks, getColumns, moveTask } = useTask();
  const presenceMembers = usePresence(project._id);

  const [modal, setModal]           = useState(null);   // null | { status } | { task }
  const [activeTask, setActiveTask] = useState(null);   // task being dragged (for DragOverlay)

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // ── Sensors ────────────────────────────────────────────────────────────────
  // Require 8px movement before a drag starts — prevents accidental drags on click
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  // ── Drag handlers ──────────────────────────────────────────────────────────
  const handleDragStart = useCallback(({ active }) => {
    const task = tasks.find((t) => t._id === active.id);
    setActiveTask(task ?? null);
  }, [tasks]);

  const handleDragOver = useCallback(({ active, over }) => {
    if (!over) return;

    const activeId  = active.id;
    const overId    = over.id;

    if (activeId === overId) return;

    const activeTask = tasks.find((t) => t._id === activeId);
    if (!activeTask) return;

    // overId is either a column status string or another task's _id
    const overIsColumn = TASK_STATUSES.includes(overId);
    const destStatus   = overIsColumn
      ? overId
      : tasks.find((t) => t._id === overId)?.status;

    if (!destStatus || destStatus === activeTask.status) return;

    // Optimistically move to the new column (order will be finalised in dragEnd)
    moveTask(activeId, destStatus, activeTask.order);
  }, [tasks, moveTask]);

  const handleDragEnd = useCallback(({ active, over }) => {
    setActiveTask(null);
    if (!over) return;

    const activeId = active.id;
    const overId   = over.id;

    const activeTaskObj = tasks.find((t) => t._id === activeId);
    if (!activeTaskObj) return;

    const overIsColumn = TASK_STATUSES.includes(overId);
    const destStatus   = overIsColumn
      ? overId
      : tasks.find((t) => t._id === overId)?.status ?? activeTaskObj.status;

    // Build the destination column's task list (after the status change)
    const destTasks = tasks
      .filter((t) => t.status === destStatus)
      .sort((a, b) => a.order - b.order);

    let newOrder;

    if (overIsColumn || activeId === overId) {
      // Dropped onto the column itself or same position — put at end
      newOrder = destTasks.length > 0
        ? Math.max(...destTasks.map((t) => t.order)) + 1
        : 0;
    } else {
      // Dropped onto another task — insert before/after it
      const overTask  = destTasks.find((t) => t._id === overId);
      const overIndex = destTasks.findIndex((t) => t._id === overId);
      const activeIndex = destTasks.findIndex((t) => t._id === activeId);

      if (overTask) {
        const reordered = arrayMove(
          destTasks.map((t) => t._id),
          activeIndex === -1 ? destTasks.length : activeIndex,
          overIndex
        );
        newOrder = reordered.indexOf(activeId);
      } else {
        newOrder = destTasks.length;
      }
    }

    moveTask(activeId, destStatus, newOrder);
  }, [tasks, moveTask]);

  const columns = getColumns();

  const openCreate = (status) => setModal({ status });
  const openEdit   = (task)   => setModal({ task });
  const closeModal = ()       => setModal(null);

  return (
    <AppShell>
      <div className="flex flex-col h-[calc(100vh-57px)]">
        {/* Page header */}
        <div className="px-6 py-4 border-b border-gray-800 shrink-0">
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
            <div className="flex items-center gap-4">
              <PresenceBar members={presenceMembers} />
              {/* Docs link */}
              <button
                onClick={() => navigate(`/workspaces/${workspaceId}/projects/${project._id}/docs`)}
                className="text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded-lg transition"
              >
                📄 Docs
              </button>
              <button
                onClick={() => openCreate('Todo')}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
              >
                + New task
              </button>
            </div>
          </div>
        </div>

        {/* Board */}
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
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
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

              {/* Floating card that follows the cursor while dragging */}
              <DragOverlay dropAnimation={{
                duration: 200,
                easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
              }}>
                {activeTask && (
                  <TaskCard
                    task={activeTask}
                    onEdit={() => {}}
                    isDragOverlay
                  />
                )}
              </DragOverlay>
            </DndContext>
          )}
        </div>
      </div>

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
