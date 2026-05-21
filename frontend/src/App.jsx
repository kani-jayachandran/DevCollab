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
import KanbanPage from './pages/KanbanPage.jsx';
import DocsPage from './pages/DocsPage.jsx';
import DocEditorPage from './pages/DocEditorPage.jsx';

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
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />

            {/* Protected — workspaces */}
            <Route path="/workspaces" element={<ProtectedRoute><WorkspacesPage /></ProtectedRoute>} />
            <Route path="/workspaces/:workspaceId" element={<ProtectedRoute><WorkspaceDetailPage /></ProtectedRoute>} />

            {/* Protected — projects */}
            <Route path="/workspaces/:workspaceId/projects" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />

            {/* Protected — Kanban board */}
            <Route path="/workspaces/:workspaceId/projects/:projectId" element={<ProtectedRoute><KanbanPage /></ProtectedRoute>} />

            {/* Protected — Docs wiki */}
            <Route path="/workspaces/:workspaceId/projects/:projectId/docs" element={<ProtectedRoute><DocsPage /></ProtectedRoute>} />
            <Route path="/workspaces/:workspaceId/projects/:projectId/docs/:docId" element={<ProtectedRoute><DocEditorPage /></ProtectedRoute>} />

            {/* Default */}
            <Route path="*" element={<Navigate to="/workspaces" replace />} />
          </Routes>
        </WorkspaceProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
