import { X } from 'lucide-react';

export default function LogsPanel({ logs, onClose, isOpen }) {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Activity Logs</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-muted rounded transition-colors"
        >
          <X size={20} className="text-muted-foreground" />
        </button>
      </div>

      {/* Logs Container */}
      <div className="flex-1 overflow-y-auto">
        {logs && logs.length > 0 ? (
          <div className="divide-y divide-border">
            {logs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-muted hover:bg-opacity-50 transition-colors">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="font-semibold text-accent">{log.user}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(log.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {log.action}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>No activity logs yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
