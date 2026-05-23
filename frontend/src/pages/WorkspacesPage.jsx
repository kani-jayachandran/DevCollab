import { useEffect, useState } from 'react';
import AppShell from '../components/AppShell.jsx';
import WorkspaceCard from '../components/WorkspaceCard.jsx';
import CreateWorkspaceModal from '../components/CreateWorkspaceModal.jsx';
import SkeletonCard from '../components/SkeletonCard.jsx';
import { useWorkspace } from '../context/WorkspaceContext.jsx';

export default function WorkspacesPage() {
  const { workspaces, loading, error, loadWorkspaces } = useWorkspace();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadWorkspaces();
  }, [loadWorkspaces]);

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold">Workspaces</h1>
            <p className="text-gray-400 text-sm mt-1">
              All workspaces you own or belong to
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            + New workspace
          </button>
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {!loading && !error && workspaces.length === 0 && (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">🗂️</div>
            <p className="text-gray-400 text-sm">No workspaces yet.</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 text-indigo-400 hover:text-indigo-300 text-sm transition"
            >
              Create your first workspace →
            </button>
          </div>
        )}

        {!loading && !error && workspaces.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {workspaces.map((ws) => (
              <WorkspaceCard key={ws._id} workspace={ws} />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <CreateWorkspaceModal onClose={() => setShowModal(false)} />
      )}
    </AppShell>
  );
}
