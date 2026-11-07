import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import AppShell from './components/layout/AppShell';
import PagePlaceholder from './pages/PagePlaceholder';

export default function App() {
  return (
    <>
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<PagePlaceholder title="Landing page" />} />
        <Route path="/login" element={<PagePlaceholder title="Login" />} />
        <Route path="/register" element={<PagePlaceholder title="Register" />} />

        {/* App pages inside the shell */}
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<PagePlaceholder title="Dashboard" />} />
          <Route path="/groups" element={<PagePlaceholder title="Groups" />} />
          <Route path="/expenses" element={<PagePlaceholder title="All expenses" />} />
          <Route path="/balances" element={<PagePlaceholder title="Balances" />} />
          <Route path="/settlements" element={<PagePlaceholder title="Settlements" />} />
          <Route path="/analytics" element={<PagePlaceholder title="Analytics" />} />
          <Route path="/profile" element={<PagePlaceholder title="Profile & settings" />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="top-right" />
    </>
  );
}