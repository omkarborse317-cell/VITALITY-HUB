import axios from 'axios';

function getApiBaseUrl() {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  const apiPort = import.meta.env.VITE_API_PORT || '8000';
  const { hostname, protocol } = window.location;
  if (hostname.endsWith('.app.github.dev')) {
    const apiHostname = hostname.replace(/-\d+\.app\.github\.dev$/, `-${apiPort}.app.github.dev`);
    return `${protocol}//${apiHostname}/api`;
  }

  return `http://localhost:${apiPort}/api`;
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
