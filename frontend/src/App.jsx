import React, { useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Toaster } from 'sonner';
import { checkAuth } from './store/slices/authSlice';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import GuestRoute from './components/common/GuestRoute';
import Home from './pages/Home';
import Detect from './pages/Detect';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Profile from './pages/Profile';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';

const router = createBrowserRouter([
  // Public Landing Page
  {
    path: '/',
    element: <Home />,
  },
  // Public Auth Pages (Guarded by GuestRoute: logged-in users redirected to /dashboard)
  {
    element: <GuestRoute />,
    children: [
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/register',
        element: <Register />,
      },
      {
        path: '/signup',
        element: <Register />,
      },
    ],
  },
  // Main Application Layout
  {
    element: <AppLayout />,
    children: [
      // Public App Pages (Guest accessible)
      {
        path: 'detect',
        element: <Detect />,
      },
      {
        path: 'about',
        element: <About />,
      },
      // Protected Pages (Authentication strictly required)
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: 'dashboard',
            element: <Dashboard />,
          },
          {
            path: 'history',
            element: <History />,
          },
          {
            path: 'profile',
            element: <Profile />,
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

