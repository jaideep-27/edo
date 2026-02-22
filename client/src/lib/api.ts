import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Attach JWT token to every request if available
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('edo_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Only clear the session on a definitive 401 from the server.
// Network errors, timeouts, and 5xx responses must NOT log the user out —
// those are transient failures (e.g. Render cold-start) and the stored
// token is still perfectly valid.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      typeof window !== 'undefined'
    ) {
      // Only wipe the token if it is a 401 to /auth/* — not if it's a 401
      // on an experiment/result route (those have their own error handling).
      const url = error.config?.url ?? '';
      if (url.includes('/auth/')) {
        localStorage.removeItem('edo_token');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
