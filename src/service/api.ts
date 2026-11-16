// flowboard_frontend/src/service/api.ts
import axios from 'axios';

const api = axios.create({
  // Matches backend port
  baseURL: 'http://localhost:5000/api',
});

// ── Request interceptor ──────────────────────────────────────────────────────
// Attach JWT token and X-User-Role to every request EXCEPT auth endpoints,
// which must not carry a stale/expired token that could confuse middleware.
api.interceptors.request.use((config) => {
  const url = config.url || '';
  const isAuthRoute = url.includes('/auth/');

  if (!isAuthRoute) {
    const token = localStorage.getItem('flowboard_token') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  const userStr = localStorage.getItem('flowboard_user') || localStorage.getItem('fb_user');
  const userRole = localStorage.getItem('user_role');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user?.role) {
        config.headers['X-User-Role'] = user.role;
      }
    } catch {}
  } else if (userRole) {
    config.headers['X-User-Role'] = userRole;
  }
  return config;
});

// ── Response interceptor ─────────────────────────────────────────────────────
// If any protected API call gets a 401 (token expired/invalid),
// clear stale session data so the user gets redirected to login cleanly.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || '';
    // Only clear session on 401 from non-auth routes (don't clear on wrong password)
    if (status === 401 && !url.includes('/auth/')) {
      localStorage.removeItem('flowboard_token');
      localStorage.removeItem('flowboard_user');
      localStorage.removeItem('fb_user');
      localStorage.removeItem('user_role');
      localStorage.removeItem('token');
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/admin')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;