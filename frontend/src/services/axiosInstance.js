import axios from 'axios';
import Cookies from 'js-cookie';

const TOKEN_STORAGE_KEY = 'auth_token';
const TOKEN_EXPIRY_KEY = 'token_expiry';
const TOKEN_COOKIE_NAME = 'jwt_token';
let lastNetworkErrorLogAt = 0;

// Get API base URL from environment variables
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD ? '/api' : 'http://localhost:8000/api');

// Debug: Log the API URL being used
console.log('🔌 API Base URL:', API_BASE_URL);

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor - Add JWT token to every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY) || Cookies.get('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor - Handle common errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response.data; // Return only data part of response
  },
  (error) => {
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      Cookies.remove(TOKEN_COOKIE_NAME);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(TOKEN_EXPIRY_KEY);
      // Redirect to login
      if (window.location.pathname !== '/login') {
        window.location.replace('/login');
      }
    }

    // Handle network-level failures (backend offline, DNS, blocked port) with throttled logging.
    if (!error.response) {
      const now = Date.now();
      if (now - lastNetworkErrorLogAt > 10000) {
        console.error('API Network Error:', {
          message: error.message || 'Network Error',
          url: error.config?.url,
          baseURL: error.config?.baseURL,
        });
        lastNetworkErrorLogAt = now;
      }

      return Promise.reject(error);
    }

    console.error('API Error:', {
      status: error.response.status,
      message: error.response.data?.message || error.message,
      url: error.config?.url,
    });

    return Promise.reject(error.response?.data || error);
  }
);

export default axiosInstance;
