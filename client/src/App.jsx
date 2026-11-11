import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import AppShell from './components/layout/AppShell';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicOnlyRoute from './components/auth/PublicOnlyRoute';
import PagePlaceholder from './pages/PagePlaceholder';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Groups from './pages/Groups';
import CreateGroup from './pages/CreateGroup';
import JoinGroup from './pages/JoinGroup';

export default function App() {
  return (
    <>
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<Landing />} />
        <Route path="/forgot-password" element={<PagePlaceholder title="Forgot password" />} />
        <Route path="/contact" element={<PagePlaceholder title="Contact" />} />
        <Route path="/privacy" element={<PagePlaceholder title="Privacy Policy" />} />
        <Route path="/terms" element={<PagePlaceholder title="Terms" />} />

        {/* Only for people who are NOT logged in */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Only for logged-in users, inside the app shell */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/groups/new" element={<CreateGroup />} />
            <Route path="/groups/join" element={<JoinGroup />} />
            <Route path="/groups/:id" element={<PagePlaceholder title="Group details" />} />
            <Route path="/expenses" element={<PagePlaceholder title="All expenses" />} />
            <Route path="/expenses/new" element={<PagePlaceholder title="Add expense" />} />
            <Route path="/balances" element={<PagePlaceholder title="Balances" />} />
            <Route path="/settlements" element={<PagePlaceholder title="Settlements" />} />
            <Route path="/analytics" element={<PagePlaceholder title="Analytics" />} />
            <Route path="/profile" element={<PagePlaceholder title="Profile & settings" />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="top-right" />
    </>
  );
}