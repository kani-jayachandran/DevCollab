import api from './axiosInstance.js';

const base = (workspaceId, projectId) =>
  `/workspaces/${workspaceId}/projects/${projectId}/snippets`;

export const fetchSnippets  = (workspaceId, projectId, params = {}) =>
  api.get(base(workspaceId, projectId), { params });

export const fetchSnippet   = (workspaceId, projectId, snippetId) =>
  api.get(`${base(workspaceId, projectId)}/${snippetId}`);

export const createSnippet  = (workspaceId, projectId, data) =>
  api.post(base(workspaceId, projectId), data);

export const updateSnippet  = (workspaceId, projectId, snippetId, data) =>
  api.patch(`${base(workspaceId, projectId)}/${snippetId}`, data);

export const deleteSnippet  = (workspaceId, projectId, snippetId) =>
  api.delete(`${base(workspaceId, projectId)}/${snippetId}`);
