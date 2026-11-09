import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import FullPageLoader from '../ui/FullPageLoader';

// Wraps every page that needs a logged-in user.
export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullPageLoader label="Checking your session…" />;

  // Remember where the person was going, so login can send them back there.
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;

  return <Outlet />;
}