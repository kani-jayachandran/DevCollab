import { createContext, useContext, useState, useCallback } from 'react';
import {
  fetchProjects,
  createProject as apiCreate,
  deleteProject as apiDelete,
} from '../api/projectApi.js';

const ProjectContext = createContext(null);

export function ProjectProvider({ workspaceId, children }) {
  const [projects, setProjects]   = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await fetchProjects(workspaceId);
      setProjects(data.projects);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  const addProject = useCallback(async (payload) => {
    const { data } = await apiCreate(workspaceId, payload);
    setProjects((prev) => [data.project, ...prev]);
    return data.project;
  }, [workspaceId]);

  const removeProject = useCallback(async (projectId) => {
    await apiDelete(workspaceId, projectId);
    setProjects((prev) => prev.filter((p) => p._id !== projectId));
  }, [workspaceId]);

  return (
    <ProjectContext.Provider
      value={{ projects, loading, error, loadProjects, addProject, removeProject }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useProject = () => {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProject must be used inside ProjectProvider');
  return ctx;
};
