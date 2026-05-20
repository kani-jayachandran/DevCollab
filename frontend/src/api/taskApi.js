import api from './axiosInstance.js';

const base = (workspaceId, projectId) =>
  `/workspaces/${workspaceId}/projects/${projectId}/tasks`;

export const fetchTasks  = (workspaceId, projectId) =>
  api.get(base(workspaceId, projectId));

export const fetchTask   = (workspaceId, projectId, taskId) =>
  api.get(`${base(workspaceId, projectId)}/${taskId}`);

export const createTask  = (workspaceId, projectId, data) =>
  api.post(base(workspaceId, projectId), data);

export const updateTask  = (workspaceId, projectId, taskId, data) =>
  api.patch(`${base(workspaceId, projectId)}/${taskId}`, data);

export const deleteTask  = (workspaceId, projectId, taskId) =>
  api.delete(`${base(workspaceId, projectId)}/${taskId}`);
