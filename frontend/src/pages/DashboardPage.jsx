import { useAuth } from '../context/AuthContext.jsx';
import AppShell from '../components/AppShell.jsx';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-semibold mb-1">
          Welcome back, {user?.name} 👋
        </h2>
        <p className="text-gray-400 text-sm mb-8">Your profile details.</p>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Profile
          </h3>
          <div className="grid grid-cols-2 gap-5 text-sm">
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
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
