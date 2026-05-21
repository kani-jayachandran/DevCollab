import { useState, useCallback } from 'react';
import { useAI } from '../../hooks/useAI.js';
import { generateBreakdown } from '../../api/aiApi.js';
import { createTask } from '../../api/taskApi.js';
import AILoadingDots from './AILoadingDots.jsx';

const PRIORITY_STYLES = {
  High:   'bg-red-500/15 text-red-400 border-red-500/30',
  Medium: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  Low:    'bg-blue-500/15 text-blue-400 border-blue-500/30',
};

export default function AIBreakdownPanel({ workspaceId, projectId }) {
  const [featureDesc, setFeatureDesc] = useState('');
  const [importing,   setImporting]   = useState(false);
  const [imported,    setImported]    = useState(false);
  const [importError, setImportError] = useState('');

  const apiFn = useCallback(
    (desc) => generateBreakdown(workspaceId, projectId, desc),
    [workspaceId, projectId]
  );
  const { result, loading, error, run, reset } = useAI(apiFn);

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!featureDesc.trim()) return;
    setImported(false);
    setImportError('');
    run(featureDesc.trim());
  };

  const handleImport = async () => {
    if (!result?.tasks?.length) return;
    setImporting(true);
    setImportError('');
    try {
      // Create all tasks sequentially to preserve order
      for (const task of result.tasks) {
        await createTask(workspaceId, projectId, task);
      }
      setImported(true);
    } catch (err) {
      setImportError(err.response?.data?.message || 'Failed to import tasks');
    } finally {
      setImporting(false);
    }
  };

  const handleReset = () => {
    reset();
    setFeatureDesc('');
    setImported(false);
    setImportError('');
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-800">
        <span className="text-lg">🔀</span>
        <div>
          <h3 className="text-sm font-semibold text-white">Task Breakdown</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Describe a feature and get a list of tasks to add to your board
          </p>
        </div>
      </div>

      {/* Input form */}
      <div className="px-5 pt-4 pb-3">
        <form onSubmit={handleGenerate} className="flex gap-2">
          <textarea
            value={featureDesc}
            onChange={(e) => setFeatureDesc(e.target.value)}
            placeholder="e.g. Add OAuth login with Google and GitHub, including profile sync and session management…"
            rows={3}
            disabled={loading}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none disabled:opacity-50"
          />
          <div className="flex flex-col gap-2 shrink-0">
            <button
              type="submit"
              disabled={loading || !featureDesc.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium px-3.5 py-2 rounded-lg transition"
            >
              {loading ? '…' : 'Break down'}
            </button>
            {result && (
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-gray-500 hover:text-white border border-gray-700 hover:border-gray-500 px-3.5 py-2 rounded-lg transition"
              >
                Clear
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Results */}
      <div className="px-5 pb-5">
        {loading && <AILoadingDots label="Breaking down feature…" />}

        {error && <p className="text-sm text-red-400 mt-2">{error}</p>}

        {result?.tasks?.length > 0 && !loading && (
          <>
            <div className="space-y-2 mt-2">
              {result.tasks.map((task, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 bg-gray-800/60 border border-gray-700/60 rounded-lg px-4 py-3"
                >
                  <span className="text-gray-600 text-xs font-mono mt-0.5 shrink-0 w-5 text-right">
                    {i + 1}.
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{task.title}</p>
                    {task.description && (
                      <p className="text-xs text-gray-500 mt-0.5">{task.description}</p>
                    )}
                  </div>
                  <span className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded border ${PRIORITY_STYLES[task.priority] ?? PRIORITY_STYLES.Medium}`}>
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>

            {/* Import action */}
            <div className="mt-4 flex items-center gap-3">
              {!imported ? (
                <button
                  onClick={handleImport}
                  disabled={importing}
                  className="bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition"
                >
                  {importing
                    ? `Importing ${result.tasks.length} tasks…`
                    : `Add ${result.tasks.length} tasks to board`}
                </button>
              ) : (
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <span>✓</span>
                  <span>{result.tasks.length} tasks added to your board</span>
                </div>
              )}
              {importError && (
                <p className="text-xs text-red-400">{importError}</p>
              )}
            </div>
          </>
        )}

        {!loading && !error && !result && (
          <p className="text-xs text-gray-600 mt-1">
            Describe a feature above and the AI will suggest tasks you can import directly to your board.
          </p>
        )}
      </div>
    </div>
  );
}
