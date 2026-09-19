import React, { useEffect, Suspense, lazy } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Toaster } from 'sonner';
import { checkAuth } from './store/slices/authSlice';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import GuestRoute from './components/common/GuestRoute';
import Home from './pages/Home';

// Lazy-loaded secondary route pages
const Detect = lazy(() => import('./pages/Detect'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const History = lazy(() => import('./pages/History'));
const Profile = lazy(() => import('./pages/Profile'));
const About = lazy(() => import('./pages/About'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));

function PageFallback() {
  return (
    <div
      className="min-h-[50vh] flex flex-col items-center justify-center p-6"
      role="status"
      aria-label="Loading page"
    >
      <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/60 flex items-center justify-center shadow-xs">
        <div className="w-5 h-5 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}

const router = createBrowserRouter([
  // Public Landing & About Pages
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/about',
    element: (
      <Suspense fallback={<PageFallback />}>
        <About />
      </Suspense>
    ),
  },
  // Public Auth Pages (Guarded by GuestRoute: logged-in users redirected to /dashboard)
  {
    element: <GuestRoute />,
    children: [
      {
        path: '/login',
        element: (
          <Suspense fallback={<PageFallback />}>
            <Login />
          </Suspense>
        ),
      },
      {
        path: '/register',
        element: (
          <Suspense fallback={<PageFallback />}>
            <Register />
          </Suspense>
        ),
      },
      {
        path: '/signup',
        element: (
          <Suspense fallback={<PageFallback />}>
            <Register />
          </Suspense>
        ),
      },
      {
        path: '/forgot-password',
        element: (
          <Suspense fallback={<PageFallback />}>
            <ForgotPassword />
          </Suspense>
        ),
      },
      {
        path: '/reset-password',
        element: <Navigate to="/forgot-password" replace />,
      },
    ],
  },
  // Main Application Layout (eagerly imported)
  {
    element: <AppLayout />,
    children: [
      // Public App Pages (Guest accessible)
      {
        path: 'detect',
        element: (
          <Suspense fallback={<PageFallback />}>
            <Detect />
          </Suspense>
        ),
      },
      // Protected Pages (Authentication strictly required)
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: 'dashboard',
            element: (
              <Suspense fallback={<PageFallback />}>
                <Dashboard />
              </Suspense>
            ),
          },
          {
            path: 'history',
            element: <Navigate to="/history/email" replace />,
          },
          {
            path: 'history/email',
            element: (
              <Suspense fallback={<PageFallback />}>
                <History channel="email" />
              </Suspense>
            ),
          },
          {
            path: 'history/text',
            element: (
              <Suspense fallback={<PageFallback />}>
                <History channel="sms" />
              </Suspense>
            ),
          },
          {
            path: 'history/url',
            element: (
              <Suspense fallback={<PageFallback />}>
                <History channel="url" />
              </Suspense>
            ),
          },
          {
            path: 'profile',
            element: (
              <Suspense fallback={<PageFallback />}>
                <Profile />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
  // Fallback Catch-all
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

function AppToaster() {
  const { theme } = useTheme();
  return (
    <Toaster
      theme={theme}
      richColors
      position="top-center"
      closeButton
      toastOptions={{
        className: 'shadow-2xl border font-sans',
      }}
    />
  );
}

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Check for existing session via HTTP-only cookie on startup
    dispatch(checkAuth());
  }, [dispatch]);

  return (
    <ThemeProvider>
      <AppToaster />
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

