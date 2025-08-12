import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';


const RequireAuth = ({ children }) => {
    const { status, isAuthenticated } = useAuth();
    const location = useLocation();


    if (status === 'loading') {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return children ?? <Outlet />;


}

export default RequireAuth;
