import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://taskmanagement-production-93d5.up.railway.app/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: add Authorization header from localStorage as fallback for cookies
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: save token from response headers if returned
api.interceptors.response.use(
  (response) => {
    // Some backends may return token in response body or headers
    const token = response.data?.token || response.headers['x-auth-token'];
    if (token) {
      localStorage.setItem('auth_token', token);
    }
    return response;
  },
  (error) => {
    // Clear token on 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
    }
    return Promise.reject(error);
  }
);

export default api;
