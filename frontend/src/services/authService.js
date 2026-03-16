import Cookies from 'js-cookie';
import axiosInstance from './axiosInstance';

const TOKEN_NAME = 'jwt_token';
const TOKEN_STORAGE_KEY = 'auth_token'; // localStorage backup
const TOKEN_EXPIRY_KEY = 'token_expiry';

const isProd = import.meta.env.PROD;

const decodePayload = (token) => {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const base64Url = parts[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  return JSON.parse(atob(padded));
};

const isTokenExpired = (token) => {
  try {
    const payload = decodePayload(token);
    if (!payload?.exp) return false;
    return payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
};

const authService = {
  // Register function - calls backend API
  register: async (name, email, password) => {
    try {
      const response = await axiosInstance.post('/auth/register', {
        name,
        email,
        password,
      });

      // Validate response
      if (!response.token) {
        throw new Error('No token received from server');
      }

      return response;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },

  // Login function - calls backend API
  login: async (email, password) => {
    try {
      const response = await axiosInstance.post('/auth/login', {
        email,
        password,
      });

      // Validate response
      if (!response.token) {
        throw new Error('No token received from server');
      }

      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error; // Properly throw error instead of accepting any credentials
    }
  },

  // Set token in cookies AND localStorage (7-day persistence)
  setToken: (token) => {
    // Set in cookies
    Cookies.set(TOKEN_NAME, token, {
      expires: 7, // 7 days
      secure: isProd,
      sameSite: 'strict',
    });
    
    // Also save to localStorage as backup (survives browser restart)
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    localStorage.setItem(TOKEN_EXPIRY_KEY, String(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).getTime()));
  },

  // Get token from cookies first, fallback to localStorage
  getToken: () => {
    // Try cookies first
    let token = Cookies.get(TOKEN_NAME);
    
    // If no cookie, check localStorage
    if (!token) {
      const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
      
      // Check if stored token is still valid
      if (storedToken && expiry && new Date().getTime() < parseInt(expiry)) {
        token = storedToken;
        // Restore to cookies for consistency
        Cookies.set(TOKEN_NAME, token, {
          expires: 7,
          secure: isProd,
          sameSite: 'strict',
        });
      }
    }

    if (token && isTokenExpired(token)) {
      authService.clearToken();
      return null;
    }
    
    return token;
  },

  // Clear token from both cookies and localStorage
  clearToken: () => {
    Cookies.remove(TOKEN_NAME);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
  },

  // Extract user data from JWT token (without verification - for display only)
  getUserFromToken: (token) => {
    try {
      if (!token) return null;

      const decoded = decodePayload(token);
      if (!decoded) return null;

      return {
        email: decoded.email || 'user@example.com',
        name: decoded.name || 'User',
        userId: decoded.userId || decoded.sub,
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!authService.getToken();
  },

  // Logout function
  logout: () => {
    authService.clearToken();
  },
};

export default authService;
