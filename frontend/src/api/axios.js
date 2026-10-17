import axios from 'axios';

function getApiBaseUrl() {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  const { hostname, protocol } = window.location;
  if (hostname.endsWith('.app.github.dev')) {
    return `${protocol}//${hostname.replace('-5173.', '-8000.')}/api`;
  }

  return 'http://localhost:8000/api';
}

const api = axios.create({
  baseURL: getApiBaseUrl(),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
