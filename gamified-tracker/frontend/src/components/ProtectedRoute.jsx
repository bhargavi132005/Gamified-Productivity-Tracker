import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="text-white text-center mt-10">Loading...</div>;

  // If no user is logged in, redirect to the login page
  return user ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;