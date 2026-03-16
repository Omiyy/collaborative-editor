import { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import EditorPage from './pages/EditorPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import authService from './services/authService';

function AppContent() {
  const [theme, setTheme] = useState(() => {
    // Get theme from localStorage or default to 'dark'
    return localStorage.getItem('editorTheme') || 'dark';
  });

  const { isAuthenticated, isLoading, logout } = useContext(AuthContext);

  // Apply theme to document root
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    localStorage.setItem('editorTheme', theme);
  }, [theme]);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
  };

  const handleLogout = () => {
    logout();
    authService.logout();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-border border-t-accent mb-4"></div>
          <p className="text-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="flex flex-col h-screen bg-background text-foreground">
        {isAuthenticated && (
          <Navbar
            currentTheme={theme}
            onThemeChange={handleThemeChange}
            onLogout={handleLogout}
          />
        )}

        <Routes>
          <Route
            path="/login"
            element={
              isAuthenticated ? <Navigate to="/editor" replace /> : <LoginPage />
            }
          />
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to="/editor" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/editor"
            element={
              <ProtectedRoute>
                <EditorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/editor/:docId"
            element={
              <ProtectedRoute>
                <EditorPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
