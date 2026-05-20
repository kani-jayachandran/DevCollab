import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { WorkspaceProvider } from './context/WorkspaceContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import WorkspacesPage from './pages/WorkspacesPage.jsx';
import WorkspaceDetailPage from './pages/WorkspaceDetailPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import ProjectDetailPage from './pages/ProjectDetailPage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WorkspaceProvider>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected — profile */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Protected — workspaces */}
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

            {/* Protected — projects (nested under workspace) */}
            <Route
              path="/workspaces/:workspaceId/projects"
              element={
                <ProtectedRoute>
                  <ProjectsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workspaces/:workspaceId/projects/:projectId"
              element={
                <ProtectedRoute>
                  <ProjectDetailPage />
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
