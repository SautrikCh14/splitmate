import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import FullPageLoader from '../ui/FullPageLoader';

// Wraps login and register: someone who is already logged in is sent onward.
export default function PublicOnlyRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullPageLoader />;
  if (user) return <Navigate to={location.state?.from?.pathname || '/dashboard'} replace />;

  return <Outlet />;
}