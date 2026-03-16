import { useState } from 'react';
import { Save, X } from 'lucide-react';

export default function SaveModal({ isOpen, onClose, documentName, documentContent }) {
  const [fileName, setFileName] = useState(documentName || 'document');
  const [format, setFormat] = useState('txt');
  const [isSaving, setIsSaving] = useState(false);

  const fileFormats = [
    { id: 'txt', label: 'Plain Text (.txt)', ext: '.txt' },
    { id: 'md', label: 'Markdown (.md)', ext: '.md' },
    { id: 'html', label: 'Web Document (.html)', ext: '.html' },
    { id: 'rtf', label: 'Rich Text (.rtf)', ext: '.rtf' },
  ];

  const handleSave = async () => {
    if (!fileName.trim()) {
      alert('Please enter a file name');
      return;
    }

    setIsSaving(true);

    try {
      const selectedFormat = fileFormats.find((f) => f.id === format);
      const fullFileName = `${fileName}${selectedFormat.ext}`;

      const temp = document.createElement('div');
      temp.innerHTML = documentContent || '';
      const plainText = (temp.textContent || temp.innerText || '').trim();

      let outputContent = documentContent || '';
      if (format === 'txt' || format === 'md' || format === 'rtf') {
        outputContent = plainText;
      }

      // Create blob from content
      const blob = new Blob([outputContent], { type: 'text/plain' });

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fullFileName;

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      onClose();
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save document');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <Save className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-semibold text-foreground">Save Document</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* File Name Input */}
          <div>
            <label htmlFor="filename" className="block text-sm font-medium text-foreground mb-2">
              File Name
            </label>
            <input
              id="filename"
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Enter file name"
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent transition-colors"
              disabled={isSaving}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Don't include file extension, it will be added automatically
            </p>
          </div>

          {/* File Format Selector */}
          <div>
            <label htmlFor="format" className="block text-sm font-medium text-foreground mb-2">
              File Format
            </label>
            <select
              id="format"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-accent transition-colors"
              disabled={isSaving}
            >
              {fileFormats.map((fmt) => (
                <option key={fmt.id} value={fmt.id}>
                  {fmt.label}
                </option>
              ))}
            </select>
          </div>

          {/* File Preview */}
          <div className="bg-background border border-border rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-2">File will be saved as:</p>
            <p className="text-sm font-mono text-accent">
              {fileName || 'document'}
              {fileFormats.find((f) => f.id === format)?.ext}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-border">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 px-4 py-2 bg-accent text-black font-medium rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
