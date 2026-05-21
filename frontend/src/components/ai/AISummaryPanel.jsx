import { useCallback } from 'react';
import { useAI } from '../../hooks/useAI.js';
import { generateSummary } from '../../api/aiApi.js';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard.js';
import AILoadingDots from './AILoadingDots.jsx';

export default function AISummaryPanel({ workspaceId, projectId }) {
  const apiFn = useCallback(
    () => generateSummary(workspaceId, projectId),
    [workspaceId, projectId]
  );
  const { result, loading, error, run, reset } = useAI(apiFn);
  const [copied, copy] = useCopyToClipboard();

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
        <div className="flex items-center gap-2.5">
          <span className="text-lg">📊</span>
          <div>
            <h3 className="text-sm font-semibold text-white">Project Summary</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              AI-generated overview of the current board state
            </p>
          </div>
        </div>
        <button
          onClick={result ? reset : run}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium px-3.5 py-1.5 rounded-lg transition"
        >
          {loading ? 'Generating…' : result ? 'Regenerate' : 'Generate'}
        </button>
      </div>

      {/* Body */}
      <div className="px-5 py-4 min-h-[80px]">
        {loading && <AILoadingDots label="Analysing board…" />}

        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}

        {result?.summary && !loading && (
          <div className="relative group">
            <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">
              {result.summary}
            </p>
            <button
              onClick={() => copy(result.summary)}
              className={`absolute top-0 right-0 text-xs px-2.5 py-1 rounded-lg border transition opacity-0 group-hover:opacity-100
                ${copied
                  ? 'border-green-500/50 text-green-400 bg-green-500/10'
                  : 'border-gray-700 text-gray-400 hover:text-white bg-gray-900'
                }`}
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        )}

        {!loading && !error && !result && (
          <p className="text-xs text-gray-600">
            Click Generate to analyse your current board and produce a summary.
          </p>
        )}
      </div>
    </div>
  );
}
