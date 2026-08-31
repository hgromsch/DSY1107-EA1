import React from 'react';
import { useAuth0 } from '../context/Auth0Context';
import Callback from '../pages/Callback';
import Login from '../components/Login';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth0();

  if (loading) {
    return <Callback />;
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return children;
};

export default ProtectedRoute;
