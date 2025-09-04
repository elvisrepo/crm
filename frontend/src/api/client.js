import axios from "axios";

const api = axios.create({
    baseURL: 'http://localhost:8001',

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
        refreshPromise = api.post('/api/token/refresh/', {}, { withCredentials: true })
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

api.interceptors.response.use(
    // If the response is successful, just pass it through.
    (response) => response,

    // This function handles all API errors.
    async (error) => {
        const originalRequest = error.config;

        // Check for the specific conditions where we should attempt a token refresh:
        // 1. The error was a 401 Unauthorized.
        // 2. We haven't already tried to refresh the token for this specific request.
        const shouldAttemptRefresh =
            error.response?.status === 401 && !originalRequest._isRetryAfterRefresh;

        if (shouldAttemptRefresh) {
            // Mark this request as having been retried to prevent infinite loops.
            originalRequest._isRetryAfterRefresh = true;

            try {
                // Attempt to get a new access token. The refreshAccessToken function
                // is locked by a promise, so this will only run once even if
                // multiple requests fail at the same time.
                await refreshAccessToken();

                // If the refresh was successful, the new token is now stored.
                // The request interceptor will automatically add it to this new request.
                // We now retry the original request that failed.
                return api(originalRequest);

            } catch (error) {
                // If refreshAccessToken() fails, it means the refresh token is invalid.
                // The user's session is truly over. There's no way to recover.
                // We reject the promise of the original request.
                // The `refreshAccessToken` function is responsible for the actual "logout" logic
                // (clearing the token, dispatching an event, etc.).
                return Promise.reject(error);
            }
        }

        // If the error was not a 401, or if we have already tried to refresh,
        // we don't handle it here. We just let the original error propagate.
        return Promise.reject(error);
    }
);


export async function loginAndGetAccessToken({ email, password }) {
    const res = await api.post('/api/token/', {
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
        await api.post('/api/logout/', {}, { withCredentials: true });
    } catch { }
    setAccessToken(null);
}


export async function bootstrapFromRefresh() {
    if (localStorage.getItem('loggedOut') === 'true') {
        return false;
    }
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


// Account API methods
export async function getAccounts() {
    const response = await api.get('/accounts/');
    return response.data;
}

export async function getAccount(id) {
    const response = await api.get(`/accounts/${id}`);
    return response.data;
}

export async function createAccount(accountData) {
    const response = await api.post('/accounts/', accountData);
    return response.data;
}

export async function updateAccount(id, accountData) {
    const response = await api.patch(`/accounts/${id}/`, accountData);
    return response.data;
}

export async function deleteAccount(id, version) {
    const response = await api.delete(`/accounts/${id}/`, {
        data: { version }
    });
    return response.data;
}

// Contacts API methods

export async function getContacts() {
    const response = await api.get('/contacts/')
    return response.data
}

export async function createContact(contactData) {
    const response = await api.post('/contacts/',contactData)
    return response.data

}

export async function getContact(id) {
    const response = await api.get(`/contacts/${id}`)
    return response.data
}

export async function updateContact(id, contactData) {
    const response = await api.patch(`/contacts/${id}`, contactData)
    return response.data
}

export async function deleteContact(id, version) {
    const response = await api.delete(`/contacts/${id}`, {
        data : {version}
       
    })
     return response.data
}


export default api;
