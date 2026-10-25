import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/auth/AuthContext';
import LoadingState from '../components/common/LoadingState';

export function ProtectedRoute() {
  const { user, ready } = useAuth();
  const location = useLocation();
  if (!ready) return <LoadingState label="Restoring your session" />;
  return user ? <Outlet /> : <Navigate to="/login" replace state={{ from: location.pathname }} />;
}

export function AdminRoute() {
  const { user } = useAuth();
  return user?.role === 'admin' ? <Outlet /> : <Navigate to="/unauthorized" replace />;
}
