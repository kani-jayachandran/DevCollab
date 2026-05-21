import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell.jsx';
import { fetchWorkspace } from '../api/workspaceApi.js';
import { fetchDocs, createDoc, deleteDoc } from '../api/docApi.js';

export default function DocsPage() {
  const { workspaceId, projectId } = useParams();
  const navigate = useNavigate();

  const [workspace, setWorkspace] = useState(null);
  const [docs,      setDocs]      = useState([]);
  const [role,      setRole]      = useState('');
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');

  // Create-doc inline form
  const [creating,  setCreating]  = useState(false);
  const [newTitle,  setNewTitle]  = useState('');
  const [createErr, setCreateErr] = useState('');
  const [saving,    setSaving]    = useState(false);

  useEffect(() => {
    Promise.all([
      fetchWorkspace(workspaceId),
      fetchDocs(workspaceId, projectId),
    ])
      .then(([wsRes, docsRes]) => {
        setWorkspace(wsRes.data.workspace);
        setRole(wsRes.data.role);
        setDocs(docsRes.data.docs);
      })
      .catch((err) => {
        const status = err.response?.status;
        if (status === 403 || status === 404) {
          navigate(`/workspaces/${workspaceId}/projects`, { replace: true });
        } else {
          setError(err.response?.data?.message || 'Failed to load docs');
        }
      })
      .finally(() => setLoading(false));
  }, [workspaceId, projectId, navigate]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateErr('');
    if (!newTitle.trim()) { setCreateErr('Title is required'); return; }
    setSaving(true);
    try {
      const { data } = await createDoc(workspaceId, projectId, {
        title: newTitle.trim(),
        content: '',
      });
      navigate(`/workspaces/${workspaceId}/projects/${projectId}/docs/${data.doc._id}`);
    } catch (err) {
      setCreateErr(err.response?.data?.message || 'Failed to create document');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (docId, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await deleteDoc(workspaceId, projectId, docId);
      setDocs((prev) => prev.filter((d) => d._id !== docId));
    } catch {
      alert('Failed to delete document');
    }
  };

  const canCreate = ['Owner', 'Admin', 'Member'].includes(role);

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-32 text-gray-500 text-sm animate-pulse">
          Loading…
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 py-10">
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
            Board
          </button>
          <span>/</span>
          <span className="text-white">Docs</span>
        </nav>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold">Wiki</h1>
            <p className="text-gray-400 text-sm mt-1">Project documentation</p>
          </div>
          {canCreate && !creating && (
            <button
              onClick={() => { setCreating(true); setNewTitle(''); setCreateErr(''); }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
            >
              + New document
            </button>
          )}
        </div>

        {/* Inline create form */}
        {creating && (
          <form
            onSubmit={handleCreate}
            className="mb-6 bg-gray-900 border border-indigo-500/40 rounded-xl p-5 flex gap-3 items-start"
          >
            <div className="flex-1">
              <input
                autoFocus
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Document title…"
                maxLength={200}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
              {createErr && <p className="text-red-400 text-xs mt-1.5">{createErr}</p>}
            </div>
            <button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition shrink-0"
            >
              {saving ? 'Creating…' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => setCreating(false)}
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2.5 rounded-lg transition shrink-0"
            >
              Cancel
            </button>
          </form>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {/* Doc list */}
        {docs.length === 0 && !creating && (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">📄</div>
            <p className="text-gray-400 text-sm">No documents yet.</p>
            {canCreate && (
              <button
                onClick={() => setCreating(true)}
                className="mt-4 text-indigo-400 hover:text-indigo-300 text-sm transition"
              >
                Create your first document →
              </button>
            )}
          </div>
        )}

        {docs.length > 0 && (
          <div className="space-y-2">
            {docs.map((doc) => (
              <div
                key={doc._id}
                onClick={() => navigate(`/workspaces/${workspaceId}/projects/${projectId}/docs/${doc._id}`)}
                className="group flex items-center justify-between bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 cursor-pointer hover:border-indigo-500/40 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-gray-500 text-lg shrink-0">📄</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate group-hover:text-indigo-300 transition">
                      {doc.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      v{doc.version} · edited by {doc.lastEditedBy?.name ?? doc.createdBy?.name} ·{' '}
                      {new Date(doc.updatedAt).toLocaleDateString(undefined, {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(doc._id, doc.title); }}
                  className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition text-lg leading-none ml-4 shrink-0"
                  aria-label="Delete document"
                  title="Delete document"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
