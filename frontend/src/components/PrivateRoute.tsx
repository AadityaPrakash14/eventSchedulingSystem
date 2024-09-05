import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Use named import

interface TokenPayload {
  id: string;
  role: string;
  exp: number;
}

interface PrivateRouteProps {
  component: React.ComponentType<any>;
  requiredRole?: string;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ component: Component, requiredRole, ...rest }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/" />;
  }

  try {
    const decodedToken = jwtDecode<TokenPayload>(token);

    // Check if token is expired (if your JWT contains an expiration time)
    const currentTime = Date.now() / 1000; // Current time in seconds
    if (decodedToken.exp && decodedToken.exp < currentTime) {
      localStorage.removeItem('token'); // Remove token if it's expired
      return <Navigate to="/" />;
    }

    // Optional: Check if the route requires a specific role (e.g., admin)
    if (requiredRole && decodedToken.role !== requiredRole) {
      return <Navigate to="/" />; // Redirect if user doesn't have the required role
    }

    // If the token is valid and role (if required) is correct, render the component
    return <Component {...rest} />;
  } catch (error) {
    // If token is invalid or can't be decoded, redirect to login
    localStorage.removeItem('token'); // Clear invalid token from storage
    return <Navigate to="/" />;
  }
};

export default PrivateRoute;
