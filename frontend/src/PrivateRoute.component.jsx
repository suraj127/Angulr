import React from 'react';
import { Navigate } from 'react-router-dom';
import authService from './auth.service';

const PrivateRoute = ({ children }) => {
  const currentUser = authService.getCurrentUser();

  if (!currentUser) {
    // not logged in so redirect to login page with the return url
    return <Navigate to="/login" />;
  }

  // authorized so return child components
  return children;
};

export default PrivateRoute;
