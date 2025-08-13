import axios from "axios";

const api = axios.create({
    baseURL: 'http://localhost:8001/api',

})

// access token in memory
let currentAccessToken = null;
let refreshPromise = null;   // prevents multiple simultaneous refresh attempts. 
console.log("refreshPromise ", refreshPromise)
console.log("currentAccess ", currentAccessToken)

//Simple getters/setters for the access token.
export function setAccessToken(token) {
    currentAccessToken = token || null;

}
export function getAccessToken() {
    return currentAccessToken
}
//  withCredentials: true - Sends cookies with the request (your refresh token cookie!)


async function refreshAccessToken() {
    // 1. Check for an existing refresh operation
    if (!refreshPromise) {
        // If refreshPromise is null, it means no refresh is currently in progress.
        // We are the *first* request to trigger the refresh.

        // 2. Create and store the Promise
        // We immediately assign the new promise to the global 'refreshPromise' variable.
        // Now, any other calls that come in while this is running will see that
        // refreshPromise is NOT null and will skip this block.
        refreshPromise = api.post('/token/refresh/', {}, { withCredentials: true })
            .then(res => {
                // 3. Success: Store the new token
                const newAccess = res.data?.access;
                setAccessToken(newAccess); // Store the new token in memory
                return newAccess; // The promise resolves with the new token
            })
            .catch(err => {
                // 4. Failure: Clear the token
                setAccessToken(null); // Logout the user on failure
                throw err; // Re-throw the error so the caller knows it failed
            })
            .finally(() => {
                // 5. Cleanup: Reset the lock
                // This block runs whether the promise succeeded or failed.
                // We set refreshPromise back to null, unlocking it for the next
                // time a token needs to be refreshed.
                refreshPromise = null;
            });
    }

    // 6. Return the Promise
    // If we were the first call, we return the new promise we just created.
    // If we were a subsequent call (that arrived while the first was running),
    // we return the *existing* promise stored in the global variable.
    // This way, all simultaneous calls wait for the *same* single network request to complete.
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
// from frontend/src/api/client.js

api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const original = error.config;
        const isAuthError = error.response && error.response.status === 401;
        const alreadyRetried = original && original._isRetryAfterRefresh;

        if (isAuthError && !alreadyRetried) {
            try {
                // Here is the call!
                await refreshAccessToken(); // We MUST use 'await' here

                // Because we used 'await', this next line only runs *after* the
                // refreshPromise has successfully resolved. At this point, the
                // new access token is already stored in memory by setAccessToken().
                original._isRetryAfterRefresh = true;
                return api(original);  // Retry original request
            } catch {
                // This 'catch' block will execute if the refreshPromise is rejected.
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
        await api.post('/logout/', {}, { withCredentials: true });
    } catch { }
    setAccessToken(null);
}


export async function bootstrapFromRefresh() {
    try {
        // 1. Attempt to get a new access token
        // It calls refreshAccessToken(), which will send the HttpOnly
        // refresh_token cookie to the backend.
        const token = await refreshAccessToken();

        // 2. Check the result
        // If refreshAccessToken() was successful, 'token' will be a string
        // (the new access token). If it failed, it would have thrown an error.
        // The '!!' (double bang) operator is a concise way to convert a value
        // to a boolean.
        //   - If 'token' is a string (e.g., "ey..."), !!token becomes true.
        //   - If 'token' is null or undefined, !!token becomes false.
        return !!token;

    } catch {
        // 3. Handle failure
        // If refreshAccessToken() throws any error (e.g., network error,
        // or the backend responds with an error because the refresh token
        // is invalid/expired), the catch block executes.
        // It simply returns false, indicating that the auto-login failed.
        return false;
    }
}


export default api;
