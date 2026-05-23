/**
 * Generic skeleton placeholder card used while data is loading.
 * Matches the visual footprint of WorkspaceCard / ProjectCard.
 */
export default function SkeletonCard() {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg bg-gray-800 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 bg-gray-800 rounded w-2/3" />
          <div className="h-2.5 bg-gray-800 rounded w-1/2" />
        </div>
        <div className="w-14 h-5 bg-gray-800 rounded-full" />
      </div>
      <div className="flex gap-4">
        <div className="h-2.5 bg-gray-800 rounded w-20" />
        <div className="h-2.5 bg-gray-800 rounded w-24" />
      </div>
    </div>
  );
}
