## Authentication Best Practices — Conversation Transcript

### User
how to handle the authentication, currently after logging in, we save the access and refresh tokens in our localStorage. Do we need to store them in react state? Other components/pages will need authentication too, not just the login page.  what is best practice solution

### Assistant
I'll first scan the codebase to see how you're currently handling tokens (localStorage usage, axios/fetch wrappers, interceptors, and auth context), so I can give precise guidance and show the minimal changes needed.

### Assistant
Quick scan found tokens saved to localStorage in `frontend/src/pages/LoginPage.jsx` and no shared auth context or interceptors. I'll open related files to confirm current flow and see backend auth settings to tailor a best-practice solution.

### Assistant
#### Short answer
- Don’t keep tokens in React component state. Use an app-level auth context/in‑memory store and a single API client.
- Best practice:
  - Access token: in memory only (not localStorage).
  - Refresh token: HttpOnly, Secure cookie set by the backend.
  - Use an axios instance with interceptors to attach `Authorization` and auto-refresh on 401.
  - Protect routes with a `RequireAuth` wrapper and bootstrap auth on app load by attempting a refresh.

#### Why not localStorage
- localStorage is readable by JavaScript, so an XSS can exfiltrate tokens. Keeping the refresh token in an HttpOnly cookie and the access token only in memory significantly reduces blast radius.

#### What to change in this repo
- Create a shared API client: `frontend/src/api/client.js`
  - Reads the in-memory access token, sets `Authorization` on requests.
  - Response interceptor: on 401/expired, call `/api/token/refresh/` using the refresh cookie, update the in‑memory access token, retry the original request. Serialize concurrent refreshes.
- Add an auth context + hook:
  - `frontend/src/auth/AuthProvider.jsx`: holds current user and the in‑memory access token; exposes `login(email, password)`, `logout()`, and `isAuthenticated`.
  - On mount, try to refresh to bootstrap a session (silent login).
- Route guard:
  - `frontend/src/auth/RequireAuth.jsx` to redirect unauthenticated users to `/login`.
- Update `App.jsx` to wrap routes with `AuthProvider` and guard private routes.
- Update `LoginPage.jsx` to call `login()` from the auth context; stop writing tokens to localStorage and stop setting headers locally.

#### Backend adjustments (Django + SimpleJWT)
- Set refresh token as HttpOnly, Secure cookie on login and refresh responses.
  - Either use SimpleJWT’s custom views to set cookies, or a lightweight wrapper that returns `response.set_cookie('refresh', <token>, httponly=True, secure=True, samesite='Lax', path='/api/token/refresh/')`.
- Keep access tokens in the JSON body (frontend stores in memory).
- Ensure:
  - `ROTATE_REFRESH_TOKENS=True` and `BLACKLIST_AFTER_ROTATION=True` (you already have these).
  - `CORS_ALLOW_CREDENTIALS=True` and include your Vite origin in `CORS_ALLOWED_ORIGINS`.
  - If using cookies across origins, also set `CSRF_TRUSTED_ORIGINS` and send `withCredentials: true` only to refresh/login endpoints as needed.

#### If you can’t switch to cookies yet
- Still avoid keeping the access token in localStorage. Keep it in memory.
- As a stopgap, store only the refresh token in localStorage and encrypting/obfuscating it won’t truly mitigate XSS—plan to move to HttpOnly cookies.
- Same interceptors, same bootstrap-by-refresh flow.

#### Do you need React state?
- No. Put the access token in an auth context (or a small module-level variable) so all components and the API client can read it. Don’t duplicate it in per-page state.

#### Minimal shape of the solution
- Files to add:
  - `frontend/src/api/client.js`
  - `frontend/src/auth/AuthProvider.jsx`
  - `frontend/src/auth/RequireAuth.jsx`
- Edits:
  - Wrap routes with `AuthProvider` in `App.jsx`, guard private routes with `RequireAuth`.
  - Replace `LoginPage.jsx` localStorage writes with `auth.login()`.

I can wire this into your codebase (client, context, guard, and a safe refresh flow) and add the backend cookie setters if you want.

---

### User
ok sounds good, i want to  implement this myself, so guide me through it step by step

### Assistant
Here’s a clear, step-by-step plan you can implement. I’ll give you the exact files to add/edit with minimal, production-minded code.

- I’m going to outline backend changes first to set the HttpOnly refresh cookie, then frontend pieces (axios client, auth context, route guard, and wiring). No code changes are being made for you; you’ll implement them.

#### 1) Backend: issue refresh token as HttpOnly cookie

1. Create `backend/users/views_auth.py` with cookie-aware token views:

```python
# backend/users/views_auth.py
from datetime import timedelta
from django.conf import settings
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.permissions import AllowAny

REFRESH_COOKIE_NAME = "refresh_token"

COOKIE_KWARGS_DEV = dict(
    httponly=True,
    secure=False,           # True in production (HTTPS)
    samesite="Lax",         # "Lax" is a good default
    path="/api/token/refresh/",
    max_age=int(timedelta(days=1).total_seconds()),
)

class CookieTokenObtainPairView(TokenObtainPairView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        refresh = response.data.get("refresh")
        if refresh:
            response.set_cookie(REFRESH_COOKIE_NAME, refresh, **COOKIE_KWARGS_DEV)
            # Do not expose refresh token in body
            del response.data["refresh"]
        return response

class CookieTokenRefreshView(TokenRefreshView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        # Read refresh token from cookie if not provided in body
        data = request.data.copy()
        if "refresh" not in data:
            cookie_refresh = request.COOKIES.get(REFRESH_COOKIE_NAME)
            if not cookie_refresh:
                return Response({"detail": "No refresh token"}, status=status.HTTP_401_UNAUTHORIZED)
            data["refresh"] = cookie_refresh

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        response = Response(serializer.validated_data, status=status.HTTP_200_OK)

        # Rotate refresh cookie when rotation is enabled
        new_refresh = serializer.validated_data.get("refresh")
        if new_refresh:
            response.set_cookie(REFRESH_COOKIE_NAME, new_refresh, **COOKIE_KWARGS_DEV)
            del response.data["refresh"]

        return response

class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        response = Response(status=status.HTTP_204_NO_CONTENT)
        # Clear refresh cookie
        response.delete_cookie(REFRESH_COOKIE_NAME, path="/api/token/refresh/")
        return response
```

2. Wire URLs (add to your project’s `urls.py`):

```python
# backend/crm_project/urls.py
from django.contrib import admin
from django.urls import path
from users.views_auth import (
    CookieTokenObtainPairView,
    CookieTokenRefreshView,
    LogoutView,
)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/token/", CookieTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", CookieTokenRefreshView.as_view(), name="token_refresh"),
    path("api/logout/", LogoutView.as_view(), name="logout"),
]
```

3. Settings tweaks (dev-safe; harden for prod):
- In `settings.py` add:

```python
CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
```

- Keep `CORS_ALLOWED_ORIGINS` as you have it. In production, set `Secure=True` for cookies and run over HTTPS.

#### 2) Frontend: a single axios client with in-memory access token

1. Add `frontend/src/api/client.js`:

```javascript
// frontend/src/api/client.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8001/api',
});

// In-memory access token
let currentAccessToken = null;
// Promise to serialize refreshes
let refreshPromise = null;

export function setAccessToken(token) {
  currentAccessToken = token || null;
}

export function getAccessToken() {
  return currentAccessToken;
}

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = axios.post(
      'http://localhost:8001/api/token/refresh/',
      {},
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

// Attach Authorization header if we have an access token
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401, try one refresh then retry original request
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const isAuthError = error.response && error.response.status === 401;
    const alreadyRetried = original && original.__isRetryAfterRefresh;

    if (isAuthError && !alreadyRetried) {
      try {
        await refreshAccessToken();
        original.__isRetryAfterRefresh = true;
        // Use the same axios instance to retry
        return api(original);
      } catch (refreshErr) {
        // Fall through to caller; they can redirect to login
      }
    }
    return Promise.reject(error);
  }
);

export async function loginAndGetAccessToken({ email, password }) {
  const res = await axios.post(
    'http://localhost:8001/api/token/',
    { email, password },
    { withCredentials: true }
  );
  const token = res.data?.access;
  setAccessToken(token);
  return token;
}

export async function logoutOnServer() {
  try {
    await axios.post('http://localhost:8001/api/logout/', {}, { withCredentials: true });
  } catch {}
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
```

#### 3) Frontend: Auth context and hook

2. Add `frontend/src/auth/AuthProvider.jsx`:

```jsx
// frontend/src/auth/AuthProvider.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api, {
  loginAndGetAccessToken,
  logoutOnServer,
  bootstrapFromRefresh,
  getAccessToken,
} from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [status, setStatus] = useState('loading'); // 'loading' | 'authenticated' | 'unauthenticated'
  const [user, setUser] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const ok = await bootstrapFromRefresh();
      if (!mounted) return;
      if (ok) {
        setStatus('authenticated');
        // Optionally fetch current user
        // const me = await api.get('/me/');
        // setUser(me.data);
      } else {
        setStatus('unauthenticated');
      }
    })();
    return () => { mounted = false; };
  }, []);

  const login = async (email, password) => {
    await loginAndGetAccessToken({ email, password });
    setStatus('authenticated');
    // Optionally fetch current user here
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
    api, // expose configured client
  }), [status, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
```

3. Add `frontend/src/auth/RequireAuth.jsx`:

```jsx
// frontend/src/auth/RequireAuth.jsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';

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
};

export default RequireAuth;
```

#### 4) Wire the provider and guard into your router

4. Edit `frontend/src/App.jsx` to wrap with `AuthProvider` and protect private routes:

```jsx
// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import Layout from './components/Layout';
import { AuthProvider } from './auth/AuthProvider';
import RequireAuth from './auth/RequireAuth';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<RequireAuth />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<DashboardPage />} />
              {/* Other private routes */}
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
```

#### 5) Update the login page to use the context

5. Replace the submit logic in `frontend/src/pages/LoginPage.jsx` to call `auth.login` and stop touching localStorage/headers:

```jsx
// frontend/src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './LoginPage.module.css';
import { useAuth } from '../auth/AuthProvider';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      const redirectTo = location.state?.from?.pathname || '/';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      if (err?.response?.status === 401) setError('Invalid email or password.');
      else setError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginBox}>
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Salesforce.com_logo.svg/1200px-Salesforce.com_logo.svg.png" alt="Salesforce Logo" className={styles.logo} />
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <div className={styles.inputGroup}>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={styles.input} required />
          </div>
          <div className={styles.inputGroup}>
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className={styles.input} required />
          </div>
          <button type="submit" className={styles.button}>Log In</button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
```

#### 6) Using the API elsewhere
- Import `useAuth` and use `auth.api` for requests. It will attach `Authorization` and handle auto-refresh.

```jsx
const { api } = useAuth();
const { data } = await api.get('/some/protected/endpoint/');
```

#### 7) Quick dev notes
- Dev cookies: `secure=False` so they set over `http://localhost`. Switch to `True` on HTTPS in prod.
- Since frontend and backend are same-site on `localhost`, the cookie will be sent with XHR; `withCredentials: true` is required when you call refresh/login/logout.
- If you add a `/api/me/` endpoint, you can set `user` in the `AuthProvider` after login/refresh.

If you follow the steps in order (backend URLs + views, settings, then the three frontend files and two small edits), you’ll have:
- Access token only in memory.
- Refresh token in an HttpOnly cookie.
- Auto-attach Authorization header.
- Automatic refresh and retry on 401.
- Route protection and bootstrap on app load.
