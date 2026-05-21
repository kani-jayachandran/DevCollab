import { useState, useEffect } from 'react';
import { LANGUAGES } from '../lib/languages.js';

/**
 * snippet = null  → create mode
 * snippet = obj   → edit mode
 */
export default function SnippetModal({ snippet = null, onSave, onClose }) {
  const isEdit = Boolean(snippet);

  const [form, setForm] = useState({
    title:       snippet?.title       ?? '',
    description: snippet?.description ?? '',
    language:    snippet?.language    ?? 'javascript',
    code:        snippet?.code        ?? '',
    tagInput:    '',                              // raw input before pressing Enter
    tags:        snippet?.tags        ?? [],
  });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  // Sync if snippet prop changes
  useEffect(() => {
    if (snippet) {
      setForm({
        title:       snippet.title       ?? '',
        description: snippet.description ?? '',
        language:    snippet.language    ?? 'javascript',
        code:        snippet.code        ?? '',
        tagInput:    '',
        tags:        snippet.tags        ?? [],
      });
    }
  }, [snippet]);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // Add tag on Enter or comma
  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = form.tagInput.trim().toLowerCase().replace(/,/g, '');
      if (!tag) return;
      if (form.tags.length >= 10) return;
      if (form.tags.includes(tag)) { setForm((p) => ({ ...p, tagInput: '' })); return; }
      setForm((p) => ({ ...p, tags: [...p.tags, tag], tagInput: '' }));
    }
    if (e.key === 'Backspace' && !form.tagInput && form.tags.length > 0) {
      setForm((p) => ({ ...p, tags: p.tags.slice(0, -1) }));
    }
  };

  const removeTag = (tag) =>
    setForm((p) => ({ ...p, tags: p.tags.filter((t) => t !== tag) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.title.trim()) { setError('Title is required'); return; }
    if (!form.code.trim())  { setError('Code is required');  return; }

    setLoading(true);
    try {
      await onSave({
        title:       form.title.trim(),
        description: form.description.trim(),
        language:    form.language,
        code:        form.code,
        tags:        form.tags,
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save snippet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-xl shadow-xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 shrink-0">
          <h2 className="text-base font-semibold">
            {isEdit ? 'Edit snippet' : 'New snippet'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition text-xl leading-none">
            ×
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto">
          <div className="px-6 py-5 space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            {/* Title */}
            <div>
              <label htmlFor="sn-title" className="block text-sm text-gray-300 mb-1.5">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                id="sn-title" name="title" type="text" required autoFocus
                value={form.title} onChange={handleChange}
                placeholder="e.g. Debounce hook"
                maxLength={150}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="sn-desc" className="block text-sm text-gray-300 mb-1.5">
                Description <span className="text-gray-500 font-normal">(optional)</span>
              </label>
              <input
                id="sn-desc" name="description" type="text"
                value={form.description} onChange={handleChange}
                placeholder="Short description…"
                maxLength={500}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            {/* Language */}
            <div>
              <label htmlFor="sn-lang" className="block text-sm text-gray-300 mb-1.5">
                Language <span className="text-red-400">*</span>
              </label>
              <select
                id="sn-lang" name="language"
                value={form.language} onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              >
                {LANGUAGES.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {/* Code */}
            <div>
              <label htmlFor="sn-code" className="block text-sm text-gray-300 mb-1.5">
                Code <span className="text-red-400">*</span>
              </label>
              <textarea
                id="sn-code" name="code" required
                value={form.code} onChange={handleChange}
                rows={10}
                placeholder="Paste your code here…"
                spellCheck={false}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-green-300 placeholder-gray-600 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-y"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm text-gray-300 mb-1.5">
                Tags <span className="text-gray-500 font-normal">(press Enter to add, max 10)</span>
              </label>
              <div className="flex flex-wrap gap-1.5 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-500 transition min-h-[42px]">
                {form.tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-indigo-400 hover:text-white leading-none"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  name="tagInput"
                  value={form.tagInput}
                  onChange={handleChange}
                  onKeyDown={handleTagKeyDown}
                  placeholder={form.tags.length === 0 ? 'react, hooks, utility…' : ''}
                  className="flex-1 min-w-[120px] bg-transparent text-white text-xs outline-none placeholder-gray-600"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-800 flex gap-3 shrink-0">
            <button
              type="button" onClick={onClose}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-2.5 rounded-lg text-sm transition"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={loading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg text-sm transition"
            >
              {loading ? 'Saving…' : isEdit ? 'Save changes' : 'Create snippet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
