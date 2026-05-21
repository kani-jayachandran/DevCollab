/**
 * Shows avatar bubbles for other users currently viewing the same board.
 * Receives the `members` array from usePresence().
 */
export default function PresenceBar({ members }) {
  if (members.length === 0) return null;

  // Show up to 5 avatars, then a "+N" overflow badge
  const visible  = members.slice(0, 5);
  const overflow = members.length - visible.length;

  return (
    <div className="flex items-center gap-1.5" title="Users viewing this board">
      {/* Live dot */}
      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />

      {/* Avatar stack */}
      <div className="flex -space-x-2">
        {visible.map((m) => (
          <div
            key={m.socketId}
            title={m.name}
            className="w-7 h-7 rounded-full border-2 border-gray-900 bg-indigo-600/50 flex items-center justify-center text-[11px] font-semibold text-indigo-200 uppercase select-none"
          >
            {m.name?.charAt(0) ?? '?'}
          </div>
        ))}
        {overflow > 0 && (
          <div className="w-7 h-7 rounded-full border-2 border-gray-900 bg-gray-700 flex items-center justify-center text-[10px] font-medium text-gray-300 select-none">
            +{overflow}
          </div>
        )}
      </div>

      <span className="text-xs text-gray-500 hidden sm:block">
        {members.length} online
      </span>
    </div>
  );
}
