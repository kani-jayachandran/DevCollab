import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard.js';
import { LANGUAGE_LABELS } from '../lib/languages.js';

export default function SnippetCard({ snippet, onEdit, onDelete }) {
  const [copied, copy] = useCopyToClipboard();

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden group hover:border-indigo-500/30 transition">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-gray-800">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-white truncate">{snippet.title}</h3>
          {snippet.description && (
            <p className="text-xs text-gray-500 mt-0.5 truncate">{snippet.description}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Language badge */}
          <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
            {LANGUAGE_LABELS[snippet.language] ?? snippet.language}
          </span>

          {/* Copy button */}
          <button
            onClick={() => copy(snippet.code)}
            title="Copy code"
            className={`text-xs px-2.5 py-1 rounded-lg border transition
              ${copied
                ? 'border-green-500/50 text-green-400 bg-green-500/10'
                : 'border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'
              }`}
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>

          {/* Edit */}
          <button
            onClick={() => onEdit(snippet)}
            title="Edit snippet"
            className="text-xs px-2.5 py-1 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition opacity-0 group-hover:opacity-100"
          >
            Edit
          </button>

          {/* Delete */}
          <button
            onClick={() => onDelete(snippet)}
            title="Delete snippet"
            className="text-gray-600 hover:text-red-400 transition text-lg leading-none opacity-0 group-hover:opacity-100"
          >
            ×
          </button>
        </div>
      </div>

      {/* Syntax-highlighted code */}
      <div className="overflow-x-auto text-sm">
        <SyntaxHighlighter
          language={snippet.language === 'plaintext' ? 'text' : snippet.language}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: '1rem 1.25rem',
            background: 'transparent',
            fontSize: '0.8125rem',
            lineHeight: '1.6',
          }}
          showLineNumbers
          lineNumberStyle={{ color: '#4b5563', minWidth: '2.5em' }}
          wrapLongLines={false}
        >
          {snippet.code}
        </SyntaxHighlighter>
      </div>

      {/* Tags + meta footer */}
      {(snippet.tags?.length > 0 || snippet.createdBy) && (
        <div className="flex items-center justify-between gap-3 px-5 py-2.5 border-t border-gray-800/60">
          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {snippet.tags?.map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 border border-gray-700"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Author + date */}
          <span className="text-[10px] text-gray-600 shrink-0">
            {snippet.createdBy?.name} ·{' '}
            {new Date(snippet.createdAt).toLocaleDateString(undefined, {
              month: 'short', day: 'numeric',
            })}
          </span>
        </div>
      )}
    </div>
  );
}
