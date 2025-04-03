import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

// Auth Components
import Login from '../components/Auth/Login';
import ForgotPassword from '../components/Auth/ForgotPassword';

// Dashboard and Content Components
import DashboardLayout from '../layouts/DashboardLayout';
import NotFound from '../components/common/NotFound';

/**
 * Protected Route component that redirects to login if not authenticated
 */
interface ProtectedRouteProps {
  element: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return user ? (
    <>{element}</>
  ) : (
    <Navigate to="/" state={{ from: location }} replace />
  );
};

/**
 * Admin only route component
 */
interface AdminRouteProps {
  element: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ element }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return user.role === 'admin' ? (
    <>{element}</>
  ) : (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background-light dark:bg-background-dark p-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg text-center">
        <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">
          {t('common.error')}
        </h1>
        <p className="text-gray-700 dark:text-gray-300">
          You don't have permission to access this page.
        </p>
        <button
          onClick={() => window.history.back()}
          className="mt-4 px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary-dark"
        >
          {t('common.back')}
        </button>
      </div>
    </div>
  );
};

/**
 * Main routing component for the application
 */
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute
            element={
              <DashboardLayout />
            }
          />
        }
      />

      {/* Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;