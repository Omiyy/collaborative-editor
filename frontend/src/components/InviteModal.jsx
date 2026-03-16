import { useEffect, useState } from 'react';
import { X, Send } from 'lucide-react';

export default function InviteModal({ isOpen, onClose, onInvite, docId }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setRole('viewer');
    }
  }, [isOpen, docId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    try {
      await onInvite(email, role);
      setEmail('');
      setRole('viewer');
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg p-6 w-96 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Invite User</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded transition-colors"
          >
            <X size={20} className="text-muted-foreground" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-4 py-2 bg-muted border border-border rounded text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              disabled={isLoading}
            />
          </div>

          {/* Role Dropdown */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Permission Level
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2 bg-muted border border-border rounded text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              disabled={isLoading}
            >
              <option value="viewer">Viewer (Read Only)</option>
              <option value="editor">Editor (Read & Write)</option>
            </select>
          </div>

          {/* Info Text */}
          <p className="text-xs text-muted-foreground">
            {role === 'viewer'
              ? 'Viewers can read the document but cannot make changes.'
              : 'Editors can read, write, and modify the document.'}
          </p>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-muted hover:bg-opacity-80 text-foreground rounded transition-colors font-medium"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-accent text-black rounded hover:opacity-90 transition-opacity font-medium disabled:opacity-50"
              disabled={!email.trim() || isLoading}
            >
              <Send size={18} />
              {isLoading ? 'Sending...' : 'Send Invite'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
