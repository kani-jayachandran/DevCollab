import api from './axiosInstance.js';

export const createWorkspace = (data) => api.post('/workspaces', data);
export const fetchMyWorkspaces = () => api.get('/workspaces');
export const fetchWorkspace = (id) => api.get(`/workspaces/${id}`);
export const updateWorkspace = (id, data) => api.patch(`/workspaces/${id}`, data);
export const deleteWorkspace = (id) => api.delete(`/workspaces/${id}`);
