import React, { createContext, useEffect, useMemo, useState } from 'react';
import api, {
    loginAndGetAccessToken,
    logoutOnServer,
    bootstrapFromRefresh,
    getAccessToken,

} from "../api/client"

// Context Creation & State Management
const AuthContext = createContext(null);

// Export the context so it can be used by the useAuth hook
export { AuthContext };

export function AuthProvider({ children }) {
    const [status, setStatus] = useState('loading'); // 'loading' | 'authenticated' | 'unauthenticated'
    const [user, setUser] = useState(null);

    // Bootstrap Effect - Auto-Login Check
    useEffect(() => {
        let mounted = true;
        (async () => {
            const ok = await bootstrapFromRefresh();
            if (!mounted) return;
            setStatus(ok ? 'authenticated' : 'unauthenticated');
            // Optionally: fetch user profile here and setUser(...)
        })();
        return () => { mounted = false; };
    }, [])


    const login = async (email, password) => {
        await loginAndGetAccessToken({ email, password });
        setStatus('authenticated');
        // Optionally: fetch user profile here and setUser(...)
    };


    const logout = async () => {
        await logoutOnServer();
        setUser(null);
        setStatus('unauthenticated');
    };

    const value = useMemo(() => ({
        status,
        isAuthenticated: status === 'authenticated' && !!getAccessToken(),
        user,
        login,
        logout,
        api,
    }), [status, user]);

    // Provider Component
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;



}
