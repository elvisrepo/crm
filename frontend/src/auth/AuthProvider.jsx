// src/auth/AuthProvider.jsx

import { useState, useEffect, useMemo, useCallback } from 'react'; // 1. Import useCallback
import { getAccessToken, setAccessToken, bootstrapFromRefresh, loginAndGetAccessToken, logoutOnServer } from '../api/client';
import { jwtDecode } from 'jwt-decode';
import { AuthContext } from './AuthContext'; 



export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const bootstrap = async () => {
            try {
                const refreshed = await bootstrapFromRefresh();
                if (refreshed) {
                    const token = getAccessToken();
                    const decodedUser = jwtDecode(token);
                    setUser(decodedUser);
                }
            } catch (error) {
                console.error("Bootstrap failed:", error);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        bootstrap();
    }, []);

    // 2. Wrap login in useCallback
    // The empty dependency array [] means this function will be created only ONCE.
    const login = useCallback(async (email, password) => {
        try {
            const token = await loginAndGetAccessToken({ email, password });
            const decodedUser = jwtDecode(token);
            setUser(decodedUser);
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    }, []);

    // 3. Wrap logout in useCallback
    const logout = useCallback(async () => {
        try {
            await logoutOnServer();
        } finally {
            setUser(null);
            setAccessToken(null);
        }
    }, []);

    // 4. The value object now contains STABLE functions
    const value = useMemo(
        () => ({
            user,
            isLoading,
            login,
            logout,
        }),
        [user, isLoading, login, logout] // It's good practice to include the stable functions in the deps
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}