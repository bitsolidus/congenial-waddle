import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AgentRoute = () => {
  const { isAuthenticated, user, isLoading } = useSelector((state) => state.auth);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to agent login
  if (!isAuthenticated) {
    return <Navigate to="/agent/login" replace />;
  }

  // Authenticated but not an agent - redirect based on role
  if (!user?.isAgent) {
    // If admin, redirect to admin dashboard
    if (user?.isAdmin) {
      return <Navigate to="/admin" replace />;
    }
    // Regular user - redirect to user dashboard
    return <Navigate to="/dashboard" replace />;
  }

  // User is an agent - render the protected content
  return <Outlet />;
};

export default AgentRoute;
