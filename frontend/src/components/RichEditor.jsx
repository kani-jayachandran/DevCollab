import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import CharacterCount from '@tiptap/extension-character-count';
import Placeholder from '@tiptap/extension-placeholder';
import EditorToolbar from './EditorToolbar.jsx';

/**
 * Controlled rich text editor backed by TipTap.
 *
 * Props:
 *   content   {string}   HTML string (controlled)
 *   onChange  {fn}       called with new HTML string on every keystroke
 *   editable  {boolean}  default true
 *   placeholder {string}
 */
export default function RichEditor({
  content = '',
  onChange,
  editable = true,
  placeholder = 'Start writing…',
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      TaskList,
      TaskItem.configure({ nested: true }),
      CharacterCount,
      Placeholder.configure({ placeholder }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  // Sync external content changes (e.g. loading a different doc)
  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() !== content) {
      editor.commands.setContent(content, false);
    }
  }, [content, editor]);

  // Sync editable flag
  useEffect(() => {
    editor?.setEditable(editable);
  }, [editable, editor]);

  const charCount = editor?.storage.characterCount?.characters() ?? 0;
  const wordCount = editor?.storage.characterCount?.words()      ?? 0;

  return (
    <div className="flex flex-col bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      {editable && <EditorToolbar editor={editor} />}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <EditorContent editor={editor} className="tiptap-editor" />
      </div>
      {editable && (
        <div className="px-6 py-2 border-t border-gray-800 flex items-center justify-end gap-4 text-xs text-gray-600">
          <span>{wordCount} word{wordCount !== 1 ? 's' : ''}</span>
          <span>{charCount} char{charCount !== 1 ? 's' : ''}</span>
        </div>
      )}
    </div>
  );
}
