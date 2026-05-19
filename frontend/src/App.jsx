import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { WorkspaceProvider } from './context/WorkspaceContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import WorkspacesPage from './pages/WorkspacesPage.jsx';
import WorkspaceDetailPage from './pages/WorkspaceDetailPage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WorkspaceProvider>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workspaces"
              element={
                <ProtectedRoute>
                  <WorkspacesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workspaces/:workspaceId"
              element={
                <ProtectedRoute>
                  <WorkspaceDetailPage />
                </ProtectedRoute>
              }
            />

            {/* Default */}
            <Route path="*" element={<Navigate to="/workspaces" replace />} />
          </Routes>
        </WorkspaceProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
