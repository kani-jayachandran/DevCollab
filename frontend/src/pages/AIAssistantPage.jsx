import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell.jsx';
import AISummaryPanel from '../components/ai/AISummaryPanel.jsx';
import AIStandupPanel from '../components/ai/AIStandupPanel.jsx';
import AIBreakdownPanel from '../components/ai/AIBreakdownPanel.jsx';
import AICodeReviewPanel from '../components/ai/AICodeReviewPanel.jsx';
import { fetchWorkspace } from '../api/workspaceApi.js';
import { fetchProject } from '../api/projectApi.js';

export default function AIAssistantPage() {
  const { workspaceId, projectId } = useParams();
  const navigate = useNavigate();

  const [workspace, setWorkspace] = useState(null);
  const [project,   setProject]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');

  useEffect(() => {
    Promise.all([
      fetchWorkspace(workspaceId),
      fetchProject(workspaceId, projectId),
    ])
      .then(([wsRes, projRes]) => {
        setWorkspace(wsRes.data.workspace);
        setProject(projRes.data.project);
      })
      .catch((err) => {
        const status = err.response?.status;
        if (status === 403 || status === 404) {
          navigate(`/workspaces/${workspaceId}/projects`, { replace: true });
        } else {
          setError(err.response?.data?.message || 'Failed to load project');
        }
      })
      .finally(() => setLoading(false));
  }, [workspaceId, projectId, navigate]);

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-32 text-gray-500 text-sm animate-pulse">
          Loading…
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto px-4 py-10">
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-500 mb-6 flex items-center gap-1.5 flex-wrap">
          <button onClick={() => navigate('/workspaces')} className="hover:text-white transition">
            Workspaces
          </button>
          <span>/</span>
          <button onClick={() => navigate(`/workspaces/${workspaceId}`)} className="hover:text-white transition">
            {workspace?.name}
          </button>
          <span>/</span>
          <button onClick={() => navigate(`/workspaces/${workspaceId}/projects`)} className="hover:text-white transition">
            Projects
          </button>
          <span>/</span>
          <button onClick={() => navigate(`/workspaces/${workspaceId}/projects/${projectId}`)} className="hover:text-white transition">
            {project?.name}
          </button>
          <span>/</span>
          <span className="text-white">AI Assistant</span>
        </nav>

        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl">🤖</span>
            <h1 className="text-2xl font-semibold">AI Assistant</h1>
          </div>
          <p className="text-gray-400 text-sm">
            Powered by Gemini · Analyses your board and helps you plan faster
          </p>
        </div>

        {/* API key notice — shown when key is not configured */}
        <div className="mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-5 py-4 text-sm text-yellow-300">
          <p className="font-medium mb-1">Setup required</p>
          <p className="text-yellow-400/80 text-xs">
            Add your <code className="bg-yellow-500/20 px-1 rounded">GEMINI_API_KEY</code> to{' '}
            <code className="bg-yellow-500/20 px-1 rounded">backend/.env</code> to enable AI features.
            Get a free key at{' '}
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-yellow-200 transition"
            >
              aistudio.google.com
            </a>
            .
          </p>
        </div>

        {/* AI panels */}
        <div className="space-y-5">
          <AISummaryPanel     workspaceId={workspaceId} projectId={projectId} />
          <AIStandupPanel     workspaceId={workspaceId} projectId={projectId} />
          <AIBreakdownPanel   workspaceId={workspaceId} projectId={projectId} />
          <AICodeReviewPanel  workspaceId={workspaceId} projectId={projectId} />
        </div>
      </div>
    </AppShell>
  );
}
