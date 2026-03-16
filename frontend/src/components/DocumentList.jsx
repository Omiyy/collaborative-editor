import { useEffect, useRef } from 'react';
import { Plus, FileText, Edit2, Trash2 } from 'lucide-react';

export default function DocumentList({
  documents,
  selectedDocId,
  onSelectDoc,
  onCreateNew,
  onEditDoc,
  onDeleteDoc,
}) {
  const itemRefs = useRef({});

  useEffect(() => {
    const selectedEl = itemRefs.current[String(selectedDocId)];
    if (selectedEl) {
      selectedEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedDocId]);

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col h-full">
      {/* Create New Button */}
      <div className="p-4 border-b border-border">
        <button
          onClick={onCreateNew}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-accent text-black rounded hover:opacity-90 transition-opacity font-semibold"
        >
          <Plus size={18} />
          Create New
        </button>
      </div>

      {/* Documents List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {documents && documents.length > 0 ? (
            <div className="space-y-1">
              {documents.map((doc) => {
                const isSelected = String(selectedDocId) === String(doc.id);
                return (
                <div
                  key={doc.id}
                  ref={(el) => {
                    itemRefs.current[String(doc.id)] = el;
                  }}
                  className={`flex items-center gap-2 px-3 py-3 rounded transition-all duration-200 group ${
                    isSelected
                      ? 'doc-item-selected shadow-md'
                      : 'hover:bg-muted'
                  }`}
                >
                  <button
                    onClick={() => onSelectDoc(doc.id)}
                    className={`flex-1 flex items-center gap-3 text-left ${
                      isSelected
                        ? 'text-foreground'
                        : 'text-foreground'
                    }`}
                  >
                    <FileText size={16} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{doc.name}</p>
                      {doc.createdAt && (
                        <p className="text-xs opacity-75">
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </button>

                  {/* Edit Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditDoc(doc.id, doc.name);
                    }}
                    className={`p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
                      isSelected
                        ? 'hover:bg-black/10'
                        : 'hover:bg-accent hover:text-black'
                    }`}
                    title="Rename document"
                  >
                    <Edit2 size={16} />
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteDoc(doc.id, doc.name);
                    }}
                    className={`p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20 hover:text-red-500 ${
                      isSelected
                        ? ''
                        : ''
                    }`}
                    title="Delete document"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground text-sm py-8">
              No documents yet
            </p>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-border text-xs text-muted-foreground">
        <p>Documents</p>
      </div>
    </div>
  );
}
