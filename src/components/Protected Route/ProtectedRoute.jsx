import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '../../context/UserContext.jsx';

const ProtectedRoute = () => {
    const { user, loading } = useUser();

    if (loading) {
        return <div>Loading...</div>; // Show loading until auth check is complete
    }

    return user?.isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;
