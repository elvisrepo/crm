// src/auth/AuthProvider.jsx

import { createContext, useState, useEffect, useMemo } from 'react';
import { getAccessToken, setAccessToken, bootstrapFromRefresh, loginAndGetAccessToken, logoutOnServer } from '../api/client';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    // 1. Add isLoading state to track the initial session check
    const [isLoading, setIsLoading] = useState(true);

    console.log(' user', user)

    // This effect runs only once on initial app load
    useEffect(() => {
        const bootstrap = async () => {
            try {
                // Attempt to refresh the token and get user data
                const refreshed = await bootstrapFromRefresh();
                if (refreshed) {
                    const token = getAccessToken();
                    const decodedUser = jwtDecode(token);
                    console.log('decoded user', decodedUser)
                    setUser(decodedUser);
                    
                }
            } catch (error) {
                // If bootstrap fails, it's okay. The user is simply not logged in.
                console.error("Bootstrap failed:", error);
                setUser(null);
            } finally {
                // 2. Set loading to false after the attempt is complete
                setIsLoading(false);
            }
        };

        bootstrap();
    }, []);

    const login = async (email, password) => {
        try {
            const token = await loginAndGetAccessToken({ email, password });
            const decodedUser = jwtDecode(token);
            setUser(decodedUser);
        } catch (error) {
            // Let the caller (LoginPage) handle the error display
            console.error("Login failed:", error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await logoutOnServer();
        } finally {
            // Always clear user state and token from the frontend
            setUser(null);
            setAccessToken(null);
        }
    };

    // 3. Memoize the context value, including the new isLoading state
    const value = useMemo(
        () => ({
            user,
            isLoading, // Expose isLoading to consumers
            login,
            logout,
        }),
        [user, isLoading] // Add isLoading to the dependency array
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}