import api from './axiosInstance.js';

const base = (workspaceId) => `/workspaces/${workspaceId}/projects`;

export const fetchProjects  = (workspaceId)           => api.get(base(workspaceId));
export const fetchProject   = (workspaceId, projectId) => api.get(`${base(workspaceId)}/${projectId}`);
export const createProject  = (workspaceId, data)      => api.post(base(workspaceId), data);
export const updateProject  = (workspaceId, projectId, data) =>
  api.patch(`${base(workspaceId)}/${projectId}`, data);
export const deleteProject  = (workspaceId, projectId) =>
  api.delete(`${base(workspaceId)}/${projectId}`);
