import api from './axiosInstance.js';

const base = (workspaceId, projectId) =>
  `/workspaces/${workspaceId}/projects/${projectId}/ai`;

/** POST → { summary: string } */
export const generateSummary = (workspaceId, projectId) =>
  api.post(`${base(workspaceId, projectId)}/summary`);

/** POST → { report: string } */
export const generateStandup = (workspaceId, projectId) =>
  api.post(`${base(workspaceId, projectId)}/standup`);

/** POST { featureDescription } → { tasks: Task[] } */
export const generateBreakdown = (workspaceId, projectId, featureDescription) =>
  api.post(`${base(workspaceId, projectId)}/breakdown`, { featureDescription });
