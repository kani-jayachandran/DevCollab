import { useCallback } from 'react';
import { useAI } from '../../hooks/useAI.js';
import { generateStandup } from '../../api/aiApi.js';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard.js';
import AILoadingDots from './AILoadingDots.jsx';

/**
 * Renders markdown-style bold headings (**text**) as styled spans.
 * Keeps the component dependency-free (no markdown library needed).
 */
function StandupText({ text }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        // Bold heading: **Yesterday** etc.
        if (/^\*\*.+\*\*/.test(line)) {
          const heading = line.replace(/\*\*/g, '');
          return (
            <p key={i} className="text-xs font-semibold text-indigo-300 mt-3 first:mt-0 uppercase tracking-wider">
              {heading}
            </p>
          );
        }
        // Bullet
        if (line.startsWith('- ') || line.startsWith('• ')) {
          return (
            <p key={i} className="text-sm text-gray-200 pl-3">
              {line}
            </p>
          );
        }
        // Empty line
        if (!line.trim()) return <div key={i} className="h-1" />;
        // Normal line
        return <p key={i} className="text-sm text-gray-200">{line}</p>;
      })}
    </div>
  );
}

export default function AIStandupPanel({ workspaceId, projectId }) {
  const apiFn = useCallback(
    () => generateStandup(workspaceId, projectId),
    [workspaceId, projectId]
  );
  const { result, loading, error, run, reset } = useAI(apiFn);
  const [copied, copy] = useCopyToClipboard();

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
        <div className="flex items-center gap-2.5">
          <span className="text-lg">🗓️</span>
          <div>
            <h3 className="text-sm font-semibold text-white">Daily Standup</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Auto-generated standup report from your board
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
        {loading && <AILoadingDots label="Writing standup…" />}

        {error && <p className="text-sm text-red-400">{error}</p>}

        {result?.report && !loading && (
          <div className="relative group">
            <StandupText text={result.report} />
            <button
              onClick={() => copy(result.report)}
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
            Click Generate to create a standup report based on your current tasks.
          </p>
        )}
      </div>
    </div>
  );
}
