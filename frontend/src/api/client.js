import axios from "axios";

const api = axios.create({
    baseURL: 'http://localhost:8001/api',

})

// access token in memory
let currentAccessToken = null;
let refreshPromise = null;   // prevents multiple simultaneous refresh attempts. 

//Simple getters/setters for the access token.
export function setAccessToken(token) {
    currentAccessToken = token || null;

}
export function getAccessToken() {
    return currentAccessToken
}
//  withCredentials: true - Sends cookies with the request (your refresh token cookie!)
async function refreshAccessToken() {
    if (!refreshPromise) {
        refreshPromise = axios.post('http://localhost:8001/api/token/refresh/', {},
            { withCredentials: true }
        ).then(res => {
            const newAccess = res.data?.access;
            setAccessToken(newAccess);
            return newAccess;
        }).catch(err => {
            setAccessToken(null);
            throw err;
        }).finally(() => {
            refreshPromise = null;
        });
    }
    return refreshPromise;
}

// Automatically adds the Authorization: Bearer <token> header to every request.
api.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response Interceptor
api.interceptors.response.use(
    (res) => res,  // Success responses pass through
    async (error) => {
        const original = error.config;
        const isAuthError = error.response && error.response.status === 401;
        const alreadyRetried = original && original._isRetryAfterRefresh;

        if (isAuthError && !alreadyRetried) {
            try {
                await refreshAccessToken();
                original._isRetryAfterRefresh = true;
                return api(original);  // Retry original request
            } catch {
                // Refresh failed, redirect to login
            }
        }
        return Promise.reject(error);
    }
);

export async function loginAndGetAccessToken({ email, password }) {
    const res = await api.post('/token/', {
        email,
        password
    },
        { withCredentials: true }
    )

    const token = res.data?.access;
    setAccessToken(token)
    return token;
}

export async function logoutOnServer() {
    try {
        await axios.post('http://localhost:8001/api/logout/', {}, { withCredentials: true });
    } catch { }
    setAccessToken(null);
}


export async function bootstrapFromRefresh() {
    try {
        const token = await refreshAccessToken();
        return !!token;
    } catch {
        return false;
    }
}

export default api;
