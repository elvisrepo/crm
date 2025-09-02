// src/auth/AuthProvider.jsx

import { useState, useEffect, useMemo, useCallback } from 'react';
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

    const login = useCallback(async (email, password) => {
        try {
            const token = await loginAndGetAccessToken({ email, password });
            const decodedUser = jwtDecode(token);
            setUser(decodedUser);
            localStorage.removeItem('loggedOut');
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await logoutOnServer();
        } finally {
            setUser(null);
            setAccessToken(null);
            localStorage.setItem('loggedOut', 'true');
        }
    }, []);

    const value = useMemo(
        () => ({
            user,
            isLoading,
            login,
            logout,
        }),
        [user, isLoading, login, logout]
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
