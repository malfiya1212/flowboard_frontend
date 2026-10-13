// flowboard_frontend/src/service/api.ts
import axios from 'axios';

const api = axios.create({
  // Matches backend port
  baseURL: 'http://localhost:5000/api', 
});

// Automatically attach JWT token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('flowboard_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const userStr = localStorage.getItem('flowboard_user');
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

export default api;