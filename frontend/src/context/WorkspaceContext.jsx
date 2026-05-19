import { createContext, useContext, useState, useCallback } from 'react';
import {
  fetchMyWorkspaces,
  createWorkspace as apiCreate,
  deleteWorkspace as apiDelete,
} from '../api/workspaceApi.js';

const WorkspaceContext = createContext(null);

export function WorkspaceProvider({ children }) {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadWorkspaces = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await fetchMyWorkspaces();
      setWorkspaces(data.workspaces);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load workspaces');
    } finally {
      setLoading(false);
    }
  }, []);

  const addWorkspace = useCallback(async (payload) => {
    const { data } = await apiCreate(payload);
    setWorkspaces((prev) => [data.workspace, ...prev]);
    return data.workspace;
  }, []);

  const removeWorkspace = useCallback(async (id) => {
    await apiDelete(id);
    setWorkspaces((prev) => prev.filter((w) => w._id !== id));
  }, []);

  return (
    <WorkspaceContext.Provider
      value={{ workspaces, loading, error, loadWorkspaces, addWorkspace, removeWorkspace }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useWorkspace = () => {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used inside WorkspaceProvider');
  return ctx;
};
