import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import useAuthStore from "../store/authStore";
import LoginPage from "@/pages/LoginPage";
import HomePage from "@/pages/HomePage";
import TasksPage from "@/pages/TasksPage";
import { Loader } from "lucide-react";

export default function App() {
  const { isAuthenticated, isInitialized, initialize } = useAuthStore();

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  // Show loading state while checking auth
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Home/Layout Route */}
      <Route
        path="/"
        element={isAuthenticated ? <HomePage /> : <Navigate to="/login" />}
      >
        {/* Nested routes under HomePage */}
        <Route index element={<Navigate to="/tasks" replace />} />
        <Route path="tasks" element={<TasksPage />} />
        {/* Uncomment and add other routes as needed */}
        {/* <Route path="projects" element={<ProjectsPage />} /> */}
        {/* <Route path="projects/:projectId" element={<ProjectDetailsPage />} /> */}
        {/* <Route path="projects/:projectId/tasks" element={<TasksPage />} /> */}
        {/* <Route path="notes" element={<NotesPage />} /> */}
        {/* <Route path="projects/:projectId/notes" element={<NotesPage />} /> */}
        {/* <Route path="profile" element={<ProfilePage />} /> */}
      </Route>

      {/* Public Routes */}
      <Route
        path="/login"
        element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />}
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}