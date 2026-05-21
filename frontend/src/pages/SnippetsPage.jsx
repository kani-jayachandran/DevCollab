import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell.jsx';
import SnippetCard from '../components/SnippetCard.jsx';
import SnippetModal from '../components/SnippetModal.jsx';
import { fetchWorkspace } from '../api/workspaceApi.js';
import {
  fetchSnippets,
  createSnippet,
  updateSnippet,
  deleteSnippet,
} from '../api/snippetApi.js';
import { LANGUAGES } from '../lib/languages.js';

export default function SnippetsPage() {
  const { workspaceId, projectId } = useParams();
  const navigate = useNavigate();

  const [workspace, setWorkspace] = useState(null);
  const [snippets,  setSnippets]  = useState([]);
  const [role,      setRole]      = useState('');
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');

  // Search / filter state
  const [query,    setQuery]    = useState('');
  const [langFilter, setLangFilter] = useState('');
  const [tagFilter,  setTagFilter]  = useState('');

  // Modal state: null = closed, {} = create, snippet obj = edit
  const [modal, setModal] = useState(null);

  // ── Load workspace + snippets ─────────────────────────────────────────────
  const loadData = useCallback(async (params = {}) => {
    try {
      const [wsRes, snRes] = await Promise.all([
        workspace ? Promise.resolve({ data: { workspace, role } }) : fetchWorkspace(workspaceId),
        fetchSnippets(workspaceId, projectId, params),
      ]);
      if (!workspace) {
        setWorkspace(wsRes.data.workspace);
        setRole(wsRes.data.role);
      }
      setSnippets(snRes.data.snippets);
    } catch (err) {
      const status = err.response?.status;
      if (status === 403 || status === 404) {
        navigate(`/workspaces/${workspaceId}/projects`, { replace: true });
      } else {
        setError(err.response?.data?.message || 'Failed to load snippets');
      }
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId, projectId]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Search / filter ───────────────────────────────────────────────────────
  const handleSearch = (e) => {
    e.preventDefault();
    const params = {};
    if (query.trim())      params.q    = query.trim();
    if (langFilter)        params.lang = langFilter;
    if (tagFilter.trim())  params.tag  = tagFilter.trim().toLowerCase();
    loadData(params);
  };

  const handleClearFilters = () => {
    setQuery(''); setLangFilter(''); setTagFilter('');
    loadData();
  };

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const handleSave = async (payload) => {
    if (modal?._id) {
      // Edit
      const { data } = await updateSnippet(workspaceId, projectId, modal._id, payload);
      setSnippets((prev) => prev.map((s) => (s._id === modal._id ? data.snippet : s)));
    } else {
      // Create
      const { data } = await createSnippet(workspaceId, projectId, payload);
      setSnippets((prev) => [data.snippet, ...prev]);
    }
  };

  const handleDelete = async (snippet) => {
    if (!window.confirm(`Delete "${snippet.title}"? This cannot be undone.`)) return;
    try {
      await deleteSnippet(workspaceId, projectId, snippet._id);
      setSnippets((prev) => prev.filter((s) => s._id !== snippet._id));
    } catch {
      alert('Failed to delete snippet');
    }
  };

  const canCreate = ['Owner', 'Admin', 'Member'].includes(role);

  // ── Collect all unique tags from loaded snippets for the tag filter hint ──
  const allTags = [...new Set(snippets.flatMap((s) => s.tags ?? []))].sort();

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
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-500 mb-6 flex items-center gap-1.5 flex-wrap">
          <button onClick={() => navigate('/workspaces')} className="hover:text-white transition">Workspaces</button>
          <span>/</span>
          <button onClick={() => navigate(`/workspaces/${workspaceId}`)} className="hover:text-white transition">{workspace?.name}</button>
          <span>/</span>
          <button onClick={() => navigate(`/workspaces/${workspaceId}/projects`)} className="hover:text-white transition">Projects</button>
          <span>/</span>
          <button onClick={() => navigate(`/workspaces/${workspaceId}/projects/${projectId}`)} className="hover:text-white transition">Board</button>
          <span>/</span>
          <span className="text-white">Snippets</span>
        </nav>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Snippets</h1>
            <p className="text-gray-400 text-sm mt-1">Reusable code snippets for this project</p>
          </div>
          {canCreate && (
            <button
              onClick={() => setModal({})}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
            >
              + New snippet
            </button>
          )}
        </div>

        {/* Search + filter bar */}
        <form onSubmit={handleSearch} className="flex flex-wrap gap-2 mb-6">
          {/* Text search */}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title or tag…"
            className="flex-1 min-w-[200px] bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />

          {/* Language filter */}
          <select
            value={langFilter}
            onChange={(e) => setLangFilter(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          >
            <option value="">All languages</option>
            {LANGUAGES.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

          {/* Tag filter */}
          <input
            type="text"
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            placeholder="Filter by tag…"
            list="tag-suggestions"
            className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition w-40"
          />
          <datalist id="tag-suggestions">
            {allTags.map((t) => <option key={t} value={t} />)}
          </datalist>

          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            Search
          </button>

          {(query || langFilter || tagFilter) && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-4 py-2 rounded-lg transition"
            >
              Clear
            </button>
          )}
        </form>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {/* Empty state */}
        {snippets.length === 0 && (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">🧩</div>
            <p className="text-gray-400 text-sm">
              {query || langFilter || tagFilter
                ? 'No snippets match your search.'
                : 'No snippets yet.'}
            </p>
            {canCreate && !query && !langFilter && !tagFilter && (
              <button
                onClick={() => setModal({})}
                className="mt-4 text-indigo-400 hover:text-indigo-300 text-sm transition"
              >
                Add your first snippet →
              </button>
            )}
          </div>
        )}

        {/* Snippet list */}
        {snippets.length > 0 && (
          <div className="space-y-4">
            {snippets.map((snippet) => (
              <SnippetCard
                key={snippet._id}
                snippet={snippet}
                onEdit={(s) => setModal(s)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create / edit modal */}
      {modal !== null && (
        <SnippetModal
          snippet={modal?._id ? modal : null}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </AppShell>
  );
}
