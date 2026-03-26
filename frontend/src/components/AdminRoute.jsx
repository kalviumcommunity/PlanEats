import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import LoadingSpinner from './LoadingSpinner';

const AdminRoute = ({ children }) => {
  const { isAdmin, user } = useAuthStore();
  const location = useLocation();

  // Check if user is admin
  if (!isAdmin()) {
    // Redirect to dashboard if not admin
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }

  // Show loading while checking authentication
  if (!user) {
    return <LoadingSpinner size="large" />;
  }

  // Render children if authenticated and admin
  return children;
};

export default AdminRoute;
