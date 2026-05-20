import { createContext, useContext, useState, useCallback } from 'react';
import {
  fetchTasks,
  createTask  as apiCreate,
  updateTask  as apiUpdate,
  deleteTask  as apiDelete,
} from '../api/taskApi.js';

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

  // Returns tasks grouped by status — derived, not stored separately
  const getColumns = useCallback(() => {
    return TASK_STATUSES.reduce((acc, status) => {
      acc[status] = tasks.filter((t) => t.status === status);
      return acc;
    }, {});
  }, [tasks]);

  const addTask = useCallback(async (payload) => {
    const { data } = await apiCreate(workspaceId, projectId, payload);
    setTasks((prev) => [...prev, data.task]);
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

  return (
    <TaskContext.Provider
      value={{ tasks, loading, error, loadTasks, getColumns, addTask, editTask, removeTask }}
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
