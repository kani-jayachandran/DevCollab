import api from './axiosInstance.js';

const base = (workspaceId, projectId) =>
  `/workspaces/${workspaceId}/projects/${projectId}/docs`;

export const fetchDocs   = (workspaceId, projectId) =>
  api.get(base(workspaceId, projectId));

export const fetchDoc    = (workspaceId, projectId, docId) =>
  api.get(`${base(workspaceId, projectId)}/${docId}`);

export const createDoc   = (workspaceId, projectId, data) =>
  api.post(base(workspaceId, projectId), data);

export const updateDoc   = (workspaceId, projectId, docId, data) =>
  api.patch(`${base(workspaceId, projectId)}/${docId}`, data);

export const deleteDoc   = (workspaceId, projectId, docId) =>
  api.delete(`${base(workspaceId, projectId)}/${docId}`);
