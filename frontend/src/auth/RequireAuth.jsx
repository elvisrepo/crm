// src/auth/RequireAuth.jsx

import { useLocation, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './useAuth';

const RequireAuth = () => {
    const { user, isLoading } = useAuth(); // Destructure isLoading from the hook
    const location = useLocation();

    // 1. While the initial session is being verified, show a loading indicator
    if (isLoading) {
        // You can replace this with a more sophisticated spinner component
        return <div>Loading session...</div>;
    }

    // 2. After loading, if there's no user, redirect to login
    if (!user) {
        // Redirect them to the /login page, but save the current location they were
        // trying to go to. This allows us to send them back after they log in.
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 3. If the user is authenticated, render the child routes
    return <Outlet />;
};

export default RequireAuth;