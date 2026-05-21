/**
 * Animated loading indicator used inside AI panels.
 */
export default function AILoadingDots({ label = 'Thinking…' }) {
  return (
    <div className="flex items-center gap-2 py-2">
      <span className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </span>
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  );
}
