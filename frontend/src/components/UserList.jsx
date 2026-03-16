import { Users } from 'lucide-react';

export default function UserList({ users, canManageRoles, onChangeRole, onRemoveAccess, currentUserId }) {
  const getRoleColor = (role) => {
    switch (role) {
      case 'owner':
        return 'bg-blue-500 text-white';
      case 'editor':
        return 'bg-accent text-black';
      case 'viewer':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="p-4 border-t border-border">
      <div className="flex items-center gap-2 mb-4">
        <Users size={18} className="text-accent" />
        <h3 className="font-semibold text-foreground">
          Users ({users?.length || 0})
        </h3>
      </div>

      <div className="space-y-2">
        {users && users.length > 0 ? (
          users.map((user) => (
            <div
              key={user.memberId || user.id}
              className="p-3 bg-muted bg-opacity-50 rounded hover:bg-opacity-75 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm truncate">
                    {user.name}
                    {user.id === currentUserId ? ' (You)' : ''}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ml-2 ${getRoleColor(
                    user.role
                  )}`}
                >
                  {user.role}
                </span>
              </div>

              {canManageRoles && user.memberId && user.id !== currentUserId && (
                <div className="mt-2 flex gap-2">
                  <select
                    value={user.role}
                    onChange={(e) => onChangeRole?.(user, e.target.value)}
                    className="flex-1 px-2 py-1 text-xs bg-card border border-border rounded text-foreground"
                  >
                    <option value="viewer">viewer</option>
                    <option value="editor">editor</option>
                    <option value="owner">owner</option>
                  </select>
                  <button
                    onClick={() => onRemoveAccess?.(user)}
                    className="px-2 py-1 text-xs bg-red-500/20 text-red-500 rounded hover:bg-red-500/30"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No users connected</p>
        )}
      </div>
    </div>
  );
}
