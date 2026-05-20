import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://taskmanagement-production-93d5.up.railway.app/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

export default api;