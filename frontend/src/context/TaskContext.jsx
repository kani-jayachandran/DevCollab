import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  fetchTasks,
  createTask as apiCreate,
  updateTask as apiUpdate,
  deleteTask as apiDelete,
} from '../api/taskApi.js';
import { getSocket, EVENTS } from '../socket/socketClient.js';

const TaskContext = createContext(null);

export const TASK_STATUSES = ['Todo', 'InProgress', 'InReview', 'Done'];

export const STATUS_LABELS = {
  Todo:       'To Do',
  InProgress: 'In Progress',
  InReview:   'In Review',
  Done:       'Done',
};

export function TaskProvider({ workspaceId, projectId, children }) {
  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  // ── REST: initial load ────────────────────────────────────────────────────
  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await fetchTasks(workspaceId, projectId);
      setTasks(data.tasks);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [workspaceId, projectId]);

  // ── Socket: join room + listen for remote changes ─────────────────────────
  useEffect(() => {
    const socket = getSocket();

    // Ensure socket is connected with the latest token
    socket.auth = { token: localStorage.getItem('devcollab_token') ?? '' };
    if (!socket.connected) socket.connect();

    // Join the project room
    socket.emit('join:project', projectId);

    // ── Handlers ────────────────────────────────────────────────────────────
    const onTaskCreated = ({ task }) => {
      setTasks((prev) => {
        // Ignore if we already have it (our own optimistic add)
        if (prev.some((t) => t._id === task._id)) return prev;
        return [...prev, task];
      });
    };

    const onTaskUpdated = ({ task }) => {
      setTasks((prev) => prev.map((t) => (t._id === task._id ? task : t)));
    };

    // task:moved is a subset of task:updated — same handler
    const onTaskMoved = ({ task }) => {
      setTasks((prev) => prev.map((t) => (t._id === task._id ? task : t)));
    };

    const onTaskDeleted = ({ taskId }) => {
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    };

    socket.on(EVENTS.TASK_CREATED, onTaskCreated);
    socket.on(EVENTS.TASK_UPDATED, onTaskUpdated);
    socket.on(EVENTS.TASK_MOVED,   onTaskMoved);
    socket.on(EVENTS.TASK_DELETED, onTaskDeleted);

    return () => {
      socket.emit('leave:project', projectId);
      socket.off(EVENTS.TASK_CREATED, onTaskCreated);
      socket.off(EVENTS.TASK_UPDATED, onTaskUpdated);
      socket.off(EVENTS.TASK_MOVED,   onTaskMoved);
      socket.off(EVENTS.TASK_DELETED, onTaskDeleted);
    };
  }, [projectId]);

  // ── Derived: tasks grouped by column ─────────────────────────────────────
  const getColumns = useCallback(() => {
    return TASK_STATUSES.reduce((acc, status) => {
      acc[status] = tasks.filter((t) => t.status === status);
      return acc;
    }, {});
  }, [tasks]);

  // ── Mutations ─────────────────────────────────────────────────────────────
  const addTask = useCallback(async (payload) => {
    const { data } = await apiCreate(workspaceId, projectId, payload);
    // Server will emit task:created back to us — but add optimistically too
    setTasks((prev) =>
      prev.some((t) => t._id === data.task._id) ? prev : [...prev, data.task]
    );
    return data.task;
  }, [workspaceId, projectId]);

  const editTask = useCallback(async (taskId, payload) => {
    const { data } = await apiUpdate(workspaceId, projectId, taskId, payload);
    setTasks((prev) => prev.map((t) => (t._id === taskId ? data.task : t)));
    return data.task;
  }, [workspaceId, projectId]);

  const removeTask = useCallback(async (taskId) => {
    await apiDelete(workspaceId, projectId, taskId);
    setTasks((prev) => prev.filter((t) => t._id !== taskId));
  }, [workspaceId, projectId]);

  /**
   * moveTask — optimistic update + backend persist.
   * The server will emit task:moved to other clients.
   */
  const moveTask = useCallback(async (taskId, newStatus, newOrder) => {
    const snapshot = tasks;

    setTasks((prev) =>
      prev.map((t) =>
        t._id === taskId ? { ...t, status: newStatus, order: newOrder } : t
      )
    );

    try {
      await apiUpdate(workspaceId, projectId, taskId, {
        status: newStatus,
        order:  newOrder,
      });
    } catch (err) {
      console.error('moveTask persist failed:', err);
      setTasks(snapshot);
    }
  }, [workspaceId, projectId, tasks]);

  return (
    <TaskContext.Provider
      value={{
        tasks, loading, error,
        loadTasks, getColumns,
        addTask, editTask, removeTask, moveTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTask = () => {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTask must be used inside TaskProvider');
  return ctx;
};
