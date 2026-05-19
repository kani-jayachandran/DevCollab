import { useAuth } from '../context/AuthContext.jsx';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <span className="text-indigo-400 font-bold text-lg">DevCollab</span>
        <button
          onClick={logout}
          className="text-sm text-gray-400 hover:text-white transition"
        >
          Sign out
        </button>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto mt-16 px-4">
        <h2 className="text-2xl font-semibold mb-2">
          Welcome back, {user?.name} 👋
        </h2>
        <p className="text-gray-400 text-sm mb-8">You are authenticated.</p>

        {/* User card */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-3">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Your profile
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Name</p>
              <p className="text-white mt-0.5">{user?.name}</p>
            </div>
            <div>
              <p className="text-gray-500">Email</p>
              <p className="text-white mt-0.5">{user?.email}</p>
            </div>
            <div>
              <p className="text-gray-500">Bio</p>
              <p className="text-white mt-0.5">{user?.bio || '—'}</p>
            </div>
            <div>
              <p className="text-gray-500">Member since</p>
              <p className="text-white mt-0.5">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : '—'}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
