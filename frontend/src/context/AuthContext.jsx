import { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is already logged in on mount
  useEffect(() => {
    const token = authService.getToken();
    if (token) {
      // Verify token is valid
      try {
        const userData = authService.getUserFromToken(token);
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          authService.clearToken();
          setIsAuthenticated(false);
        }
      } catch (error) {
        authService.clearToken();
        setIsAuthenticated(false);
      }
    }
    setIsLoading(false);
  }, []);

  const register = async (name, email, password) => {
    try {
      const response = await authService.register(name, email, password);
      if (response.token) {
        authService.setToken(response.token);
        const userData = authService.getUserFromToken(response.token);
        setUser(userData);
        setIsAuthenticated(true);
        return { success: true };
      }
    } catch (error) {
      return { success: false, error: error.message || 'Registration failed' };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      if (response.token) {
        authService.setToken(response.token);
        const userData = authService.getUserFromToken(response.token);
        setUser(userData);
        setIsAuthenticated(true);
        return { success: true };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    authService.clearToken();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
