/**
 * Toolbar for the TipTap rich text editor.
 * Receives the `editor` instance from useEditor().
 */
export default function EditorToolbar({ editor }) {
  if (!editor) return null;

  const btn = (active, onClick, title, children) => (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className={`px-2 py-1 rounded text-sm transition select-none
        ${active
          ? 'bg-indigo-600 text-white'
          : 'text-gray-400 hover:text-white hover:bg-gray-700'
        }`}
    >
      {children}
    </button>
  );

  return (
    <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-gray-800 bg-gray-900/60">
      {/* Text style */}
      {btn(editor.isActive('bold'),          () => editor.chain().focus().toggleBold().run(),          'Bold',          <strong>B</strong>)}
      {btn(editor.isActive('italic'),        () => editor.chain().focus().toggleItalic().run(),        'Italic',        <em>I</em>)}
      {btn(editor.isActive('underline'),     () => editor.chain().focus().toggleUnderline().run(),     'Underline',     <u>U</u>)}
      {btn(editor.isActive('strike'),        () => editor.chain().focus().toggleStrike().run(),        'Strikethrough', <s>S</s>)}
      {btn(editor.isActive('code'),          () => editor.chain().focus().toggleCode().run(),          'Inline code',   <span className="font-mono text-xs">{`</>`}</span>)}

      <span className="w-px h-5 bg-gray-700 mx-1" />

      {/* Headings */}
      {btn(editor.isActive('heading', { level: 1 }), () => editor.chain().focus().toggleHeading({ level: 1 }).run(), 'Heading 1', 'H1')}
      {btn(editor.isActive('heading', { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run(), 'Heading 2', 'H2')}
      {btn(editor.isActive('heading', { level: 3 }), () => editor.chain().focus().toggleHeading({ level: 3 }).run(), 'Heading 3', 'H3')}

      <span className="w-px h-5 bg-gray-700 mx-1" />

      {/* Lists */}
      {btn(editor.isActive('bulletList'),  () => editor.chain().focus().toggleBulletList().run(),  'Bullet list',   '• List')}
      {btn(editor.isActive('orderedList'), () => editor.chain().focus().toggleOrderedList().run(), 'Ordered list',  '1. List')}
      {btn(editor.isActive('taskList'),    () => editor.chain().focus().toggleTaskList().run(),    'Task list',     '☑ Tasks')}

      <span className="w-px h-5 bg-gray-700 mx-1" />

      {/* Blocks */}
      {btn(editor.isActive('blockquote'), () => editor.chain().focus().toggleBlockquote().run(), 'Blockquote',  '"Quote"')}
      {btn(editor.isActive('codeBlock'),  () => editor.chain().focus().toggleCodeBlock().run(),  'Code block',  '{ Code }')}
      {btn(false, () => editor.chain().focus().setHorizontalRule().run(), 'Horizontal rule', '— Rule')}

      <span className="w-px h-5 bg-gray-700 mx-1" />

      {/* History */}
      {btn(false, () => editor.chain().focus().undo().run(), 'Undo', '↩ Undo')}
      {btn(false, () => editor.chain().focus().redo().run(), 'Redo', '↪ Redo')}
    </div>
  );
}
