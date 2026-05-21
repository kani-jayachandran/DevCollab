import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell.jsx';
import RichEditor from '../components/RichEditor.jsx';
import { fetchWorkspace } from '../api/workspaceApi.js';
import { fetchDoc, updateDoc } from '../api/docApi.js';

const AUTOSAVE_DELAY = 2000; // ms after last keystroke before autosave fires

export default function DocEditorPage() {
  const { workspaceId, projectId, docId } = useParams();
  const navigate = useNavigate();

  const [workspace, setWorkspace] = useState(null);
  const [doc,       setDoc]       = useState(null);
  const [role,      setRole]      = useState('');
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');

  // Editor state
  const [title,     setTitle]     = useState('');
  const [content,   setContent]   = useState('');
  const [dirty,     setDirty]     = useState(false);   // unsaved changes
  const [saving,    setSaving]    = useState(false);
  const [saveMsg,   setSaveMsg]   = useState('');      // "Saved" flash message
  const [showHistory, setShowHistory] = useState(false);

  const autosaveTimer = useRef(null);

  // ── Load doc ───────────────────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      fetchWorkspace(workspaceId),
      fetchDoc(workspaceId, projectId, docId),
    ])
      .then(([wsRes, docRes]) => {
        setWorkspace(wsRes.data.workspace);
        setRole(wsRes.data.role);
        const d = docRes.data.doc;
        setDoc(d);
        setTitle(d.title);
        setContent(d.content);
      })
      .catch((err) => {
        const status = err.response?.status;
        if (status === 403 || status === 404) {
          navigate(`/workspaces/${workspaceId}/projects/${projectId}/docs`, { replace: true });
        } else {
          setError(err.response?.data?.message || 'Failed to load document');
        }
      })
      .finally(() => setLoading(false));
  }, [workspaceId, projectId, docId, navigate]);

  // ── Save ───────────────────────────────────────────────────────────────────
  const save = useCallback(async () => {
    if (!dirty) return;
    setSaving(true);
    try {
      const { data } = await updateDoc(workspaceId, projectId, docId, { title, content });
      setDoc(data.doc);
      setDirty(false);
      setSaveMsg(`Saved · v${data.doc.version}`);
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (err) {
      setSaveMsg('Save failed');
      console.error(err);
    } finally {
      setSaving(false);
    }
  }, [dirty, workspaceId, projectId, docId, title, content]);

  // Autosave on content change
  const scheduleAutosave = useCallback(() => {
    clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(save, AUTOSAVE_DELAY);
  }, [save]);

  useEffect(() => () => clearTimeout(autosaveTimer.current), []);

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    setDirty(true);
    scheduleAutosave();
  };

  const handleContentChange = (html) => {
    setContent(html);
    setDirty(true);
    scheduleAutosave();
  };

  // Ctrl/Cmd+S manual save
  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        clearTimeout(autosaveTimer.current);
        save();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [save]);

  const canEdit = ['Owner', 'Admin', 'Member'].includes(role);

  // ── Loading / error states ─────────────────────────────────────────────────
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
      <div className="flex h-[calc(100vh-57px)]">
        {/* ── Main editor area ─────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Doc toolbar */}
          <div className="px-6 py-3 border-b border-gray-800 flex items-center justify-between shrink-0 gap-4">
            {/* Breadcrumb */}
            <nav className="text-xs text-gray-500 flex items-center gap-1.5 flex-wrap min-w-0">
              <button onClick={() => navigate('/workspaces')} className="hover:text-white transition shrink-0">
                Workspaces
              </button>
              <span>/</span>
              <button onClick={() => navigate(`/workspaces/${workspaceId}`)} className="hover:text-white transition shrink-0">
                {workspace?.name}
              </button>
              <span>/</span>
              <button onClick={() => navigate(`/workspaces/${workspaceId}/projects/${projectId}/docs`)} className="hover:text-white transition shrink-0">
                Docs
              </button>
              <span>/</span>
              <span className="text-white truncate">{doc?.title}</span>
            </nav>

            {/* Save status + actions */}
            <div className="flex items-center gap-3 shrink-0">
              {saveMsg && (
                <span className={`text-xs ${saveMsg.includes('fail') ? 'text-red-400' : 'text-green-400'}`}>
                  {saveMsg}
                </span>
              )}
              {dirty && !saving && (
                <span className="text-xs text-yellow-500">Unsaved changes</span>
              )}
              {saving && (
                <span className="text-xs text-gray-500 animate-pulse">Saving…</span>
              )}

              <button
                onClick={() => setShowHistory((v) => !v)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition
                  ${showHistory
                    ? 'border-indigo-500/60 text-indigo-300 bg-indigo-500/10'
                    : 'border-gray-700 text-gray-400 hover:text-white hover:border-gray-600'
                  }`}
              >
                History
              </button>

              {canEdit && (
                <button
                  onClick={() => { clearTimeout(autosaveTimer.current); save(); }}
                  disabled={saving || !dirty}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium px-4 py-1.5 rounded-lg transition"
                >
                  Save
                </button>
              )}
            </div>
          </div>

          {/* Title + editor */}
          <div className="flex-1 overflow-y-auto px-8 py-8 max-w-4xl mx-auto w-full">
            {/* Title input */}
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              disabled={!canEdit}
              placeholder="Untitled document"
              className="w-full bg-transparent text-3xl font-bold text-white placeholder-gray-700 outline-none mb-6 disabled:cursor-default"
            />

            {/* Meta line */}
            <div className="flex items-center gap-3 text-xs text-gray-600 mb-6">
              <span>v{doc?.version}</span>
              <span>·</span>
              <span>
                Last edited by {doc?.lastEditedBy?.name ?? doc?.createdBy?.name}
              </span>
              <span>·</span>
              <span>
                {doc?.updatedAt
                  ? new Date(doc.updatedAt).toLocaleString(undefined, {
                      month: 'short', day: 'numeric', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })
                  : '—'}
              </span>
              {!canEdit && (
                <>
                  <span>·</span>
                  <span className="text-yellow-600">Read-only</span>
                </>
              )}
            </div>

            {/* Rich editor */}
            <RichEditor
              content={content}
              onChange={handleContentChange}
              editable={canEdit}
              placeholder="Start writing your documentation…"
            />
          </div>
        </div>

        {/* ── Version history sidebar ───────────────────────────────────────── */}
        {showHistory && (
          <aside className="w-72 border-l border-gray-800 bg-gray-950 flex flex-col shrink-0">
            <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Version history</h3>
              <button
                onClick={() => setShowHistory(false)}
                className="text-gray-500 hover:text-white transition text-lg leading-none"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {(!doc?.history || doc.history.length === 0) && (
                <p className="text-xs text-gray-600 px-4 py-6 text-center">No history yet.</p>
              )}
              {[...(doc?.history ?? [])].reverse().map((v) => (
                <div
                  key={v._id}
                  className={`px-4 py-3 border-b border-gray-800/60 text-xs
                    ${v.version === doc?.version ? 'bg-indigo-500/10' : 'hover:bg-gray-900/60'}
                  `}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-white">v{v.version}</span>
                    {v.version === doc?.version && (
                      <span className="text-indigo-400 text-[10px]">Current</span>
                    )}
                  </div>
                  <p className="text-gray-400 truncate">{v.title}</p>
                  <p className="text-gray-600 mt-0.5">
                    {v.savedBy?.name ?? 'Unknown'} ·{' '}
                    {new Date(v.savedAt).toLocaleString(undefined, {
                      month: 'short', day: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>
    </AppShell>
  );
}
