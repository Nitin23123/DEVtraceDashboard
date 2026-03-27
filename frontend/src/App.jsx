import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TasksPage from './pages/TasksPage';
import NotesPage from './pages/NotesPage';
import GoalsPage from './pages/GoalsPage';
import ApiTesterPage from './pages/ApiTesterPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import PomodoroPage from './pages/PomodoroPage';
import SnippetsPage from './pages/SnippetsPage';
import DsaPage from './pages/DsaPage';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes with Layout nav */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/tasks"     element={<TasksPage />} />
          <Route path="/notes"     element={<NotesPage />} />
          <Route path="/goals"     element={<GoalsPage />} />
          <Route path="/api-tester" element={<ApiTesterPage />} />
          <Route path="/profile"   element={<ProfilePage />} />
          <Route path="/pomodoro"  element={<PomodoroPage />} />
          <Route path="/snippets"  element={<SnippetsPage />} />
          <Route path="/dsa"       element={<DsaPage />} />
        </Route>

        {/* Redirects */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AnimatedRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
