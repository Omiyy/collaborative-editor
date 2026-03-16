import { useState, useContext } from 'react';
import { Moon, Sun, MoreVertical, LogOut } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export default function Navbar({ currentTheme, onThemeChange, onLogout }) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, isAuthenticated } = useContext(AuthContext);

  const themes = [
    { id: 'dark', label: 'Dark' },
    { id: 'light', label: 'Light' },
    // { id: 'orange', label: 'Orange' },
  ];

  const handleThemeChange = (themeId) => {
    onThemeChange(themeId);
    setShowUserMenu(false);
  };

  const userInitials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'U';

  return (
    <nav className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
      {/* Left Section - App Name */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-accent rounded">
          <span className="text-black font-bold text-lg">CE</span>
        </div>
        <h1 className="text-xl font-bold text-foreground">
          Collab Editor
        </h1>
      </div>

      {/* Right Section - Controls */}
      <div className="flex items-center gap-6">
        {/* Theme Toggle */}
        <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
          {currentTheme === 'dark' ? (
            <Moon size={18} className="text-accent" />
          ) : (
            <Sun size={18} className="text-accent" />
          )}
          <select
            value={currentTheme}
            onChange={(e) => handleThemeChange(e.target.value)}
            className="bg-transparent text-foreground text-sm font-medium focus:outline-none cursor-pointer"
          >
            {themes.map((theme) => (
              <option key={theme.id} value={theme.id}>
                {theme.label}
              </option>
            ))}
          </select>
        </div>

        {/* User Section - Only show when authenticated */}
        {isAuthenticated && user ? (
          <>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground leading-none">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-muted-foreground">Signed in</p>
              </div>
              <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-black font-bold text-sm">
                {userInitials}
              </div>
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="p-2 hover:bg-muted rounded transition-colors"
              >
                <MoreVertical size={20} className="text-muted-foreground" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50">
                  <button
                    onClick={() => {
                      onLogout();
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted text-foreground transition-colors first:rounded-t-lg last:rounded-b-lg text-left text-sm"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-muted-foreground text-sm">
            Not authenticated
          </div>
        )}
      </div>
    </nav>
  );
}
