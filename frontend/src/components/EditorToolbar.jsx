import { Save, History, Users } from 'lucide-react';

export default function EditorToolbar({
  onSave,
  onLogsToggle,
  onInvite,
  logsOpen,
}) {
  return (
    <div className="flex items-center justify-between bg-card border-b border-border px-4 py-3 gap-4">
      <div className="flex gap-2">
        <button
          onClick={onSave}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-black rounded hover:opacity-90 transition-opacity font-medium"
        >
          <Save size={18} />
          Save
        </button>

        <button
          onClick={onLogsToggle}
          className={`flex items-center gap-2 px-4 py-2 rounded transition-colors font-medium ${
            logsOpen
              ? 'bg-muted text-accent'
              : 'bg-muted hover:bg-opacity-80 text-foreground'
          }`}
        >
          <History size={18} />
          Logs
        </button>

        <button
          onClick={onInvite}
          className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-opacity-80 text-foreground rounded transition-colors font-medium"
        >
          <Users size={18} />
          Invite
        </button>
      </div>
    </div>
  );
}
