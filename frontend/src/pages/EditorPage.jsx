import { useState, useEffect, useContext, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import CodeEditor from '../components/CodeEditor';
import EditorToolbar from '../components/EditorToolbar';
import LogsPanel from '../components/LogsPanel';
import DocumentList from '../components/DocumentList';
import UserList from '../components/UserList';
import InviteModal from '../components/InviteModal';
import RenameModal from '../components/RenameModal';
import DeleteModal from '../components/DeleteModal';
import SaveModal from '../components/SaveModal';
import apiService from '../services/apiService';
import websocketService from '../services/websocketService';
import { AuthContext } from '../context/AuthContext';

export default function EditorPage() {
  const { docId: urlDocId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [documents, setDocuments] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState(urlDocId || null);
  const [currentDoc, setCurrentDoc] = useState(null);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [currentRole, setCurrentRole] = useState('viewer');
  const [showLogs, setShowLogs] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [renamingDocId, setRenamingDocId] = useState(null);
  const [renamingDocName, setRenamingDocName] = useState('');
  const [deletingDocId, setDeletingDocId] = useState(null);
  const [deletingDocName, setDeletingDocName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const autosaveTimerRef = useRef(null);
  const pendingContentRef = useRef(null);

  const loadRoomUsers = async (roomId) => {
    const roomUsers = await apiService.getUsersInRoom(roomId);
    setUsers(roomUsers);
    const me = roomUsers.find((roomUser) => roomUser.id === user?.userId);
    setCurrentRole(me?.role || 'viewer');
  };

  useEffect(() => {
    if (urlDocId && urlDocId !== selectedDocId) {
      setSelectedDocId(urlDocId);
    }
  }, [urlDocId]);

  // Initialize data
  useEffect(() => {
    let unsubscribeWs = null;

    const initializeEditor = async () => {
      try {
        const docs = await apiService.listDocuments();
        setDocuments(docs);

        if (!docs.length) {
          setCurrentDoc(null);
          setUsers([]);
          setLogs([]);
          return;
        }

        const targetDocId = selectedDocId || urlDocId || docs[0].id;
        if (!targetDocId) {
          return;
        }

        if (selectedDocId !== targetDocId) {
          setSelectedDocId(targetDocId);
        }

        // Load initial document
        const doc = await apiService.getDocument(targetDocId);
        setCurrentDoc(doc);

        // Resolve room id from payload shape.
        const roomId = doc?.roomId || (typeof doc?.room === 'object' ? doc?.room?._id : doc?.room);
        if (!roomId) {
          console.error('Document has no room id:', doc);
          return;
        }
        setCurrentRoomId(roomId);

        const inviteCode = new URLSearchParams(location.search).get('invite');
        if (inviteCode) {
          try {
            await apiService.joinWithInviteCode(inviteCode, targetDocId);
          } catch (error) {
            // Ignore duplicate membership errors to keep the flow idempotent.
            if (!String(error?.message || '').toLowerCase().includes('already')) {
              console.error('Failed to join via invite code:', error);
            }
          }
        }

        // Load users and determine current role.
        await loadRoomUsers(roomId);

        // Load activity logs
        const activities = await apiService.getActivityLogs(targetDocId);
        setLogs(activities);

        // Connect WebSocket
        websocketService.disconnect();
        websocketService.connect(roomId);
        unsubscribeWs = websocketService.onMessage((message) => {
          console.log('📡 WebSocket message:', message.type, message.data);
          
          if (message.type === 'code_update') {
            // Update document content from other users.
            console.log('✏️ Remote document update received');
            setCurrentDoc((prev) => 
              prev ? { ...prev, content: message.data?.content ?? prev.content } : prev
            );
          } else if (message.type === 'user_joined') {
            console.log('👥 User joined:', message.data.userName);
            loadRoomUsers(roomId).catch((error) => console.error('Failed to refresh users:', error));
          } else if (message.type === 'user_left') {
            console.log('👋 User left:', message.data.userName);
            loadRoomUsers(roomId).catch((error) => console.error('Failed to refresh users:', error));
          } else if (message.type === 'activity_logged') {
            setLogs((prev) => [message.data, ...prev]);
          }
        });
      } catch (error) {
        console.error('Failed to initialize editor:', error);
      }
    };

    initializeEditor();

    return () => {
      if (unsubscribeWs) {
        unsubscribeWs();
      }
      websocketService.disconnect();
    };
  }, [selectedDocId, urlDocId, location.search, user?.userId]);

  // Handle document selection
  const handleSelectDoc = async (docId) => {
    const nextId = String(docId);
    setSelectedDocId(nextId);
    navigate(`/editor/${nextId}`);

    try {
      // Fetch directly on click to always refresh from DB.
      const doc = await apiService.getDocument(nextId);
      setCurrentDoc(doc);

      const roomId = doc?.roomId || (typeof doc?.room === 'object' ? doc?.room?._id : doc?.room);
      if (roomId) {
        setCurrentRoomId(roomId);
        await loadRoomUsers(roomId);
      }
    } catch (error) {
      console.error('Failed to fetch document from database:', error);
    }
  };

  // Handle creating new document
  const handleCreateNew = async () => {
    try {
      console.log('📝 Creating new document...');
      const newDoc = await apiService.createDocument(
        `Document ${documents.length + 1}`
      );
      console.log('✓ Document created:', newDoc);
      setDocuments((prev) => [newDoc, ...prev]);
      setSelectedDocId(newDoc.id);
      navigate(`/editor/${newDoc.id}`);
    } catch (error) {
      console.error('❌ Failed to create document:', error);
      alert(`Failed to create document: ${error.message || 'Unknown error'}`);
    }
  };

  // Handle document changes
  const handleCodeChange = async (value) => {
    if (currentRole === 'viewer') {
      return;
    }

    setCurrentDoc((prev) =>
      prev ? { ...prev, content: value } : prev
    );

    // Send update through WebSocket
    websocketService.sendCodeUpdate(value);

    // Persist to DB every 2 seconds while typing.
    pendingContentRef.current = value;
    if (!autosaveTimerRef.current) {
      autosaveTimerRef.current = setTimeout(async () => {
        try {
          if (selectedDocId && pendingContentRef.current !== null) {
            await apiService.updateDocument(selectedDocId, pendingContentRef.current);
          }
        } catch (error) {
          console.error('Auto-save failed:', error);
        } finally {
          autosaveTimerRef.current = null;
        }
      }, 2000);
    }

    // Log the activity
    try {
      await apiService.logActivity(selectedDocId, 'edited document');
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  };

  useEffect(() => {
    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, []);

  // Refresh role/member list when room or user changes.
  useEffect(() => {
    if (!currentRoomId) {
      return;
    }

    const refreshMembers = async () => {
      try {
        await loadRoomUsers(currentRoomId);
      } catch (error) {
        const isNetworkError = error?.message === 'Network Error' || !error?.status;
        if (!isNetworkError) {
          console.error('Failed to refresh room members:', error);
        }
      }
    };

    refreshMembers();
  }, [currentRoomId, user?.userId]);

  // Handle save
  const handleSave = async () => {
    if (currentDoc) {
      try {
        await apiService.updateDocument(selectedDocId, currentDoc.content);
        console.log('Document saved successfully');
        // Open save modal to download
        setShowSaveModal(true);
      } catch (error) {
        console.error('Failed to save document:', error);
      }
    }
  };

  // Handle invite
  const handleSendInvite = async (email, role) => {
    try {
      await apiService.sendInvite(email, selectedDocId, role);
      console.log(`Invite sent to ${email} with role ${role}`);
    } catch (error) {
      console.error('Failed to send invite:', error);
    }
  };

  // Handle edit document (open rename modal)
  const handleEditDoc = (docId, docName) => {
    setRenamingDocId(docId);
    setRenamingDocName(docName);
    setShowRenameModal(true);
  };

  // Handle rename document
  const handleRenameDocument = async (newName) => {
    if (!renamingDocId || !newName.trim()) return;

    try {
      await apiService.renameDocument(renamingDocId, newName);
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === renamingDocId ? { ...doc, name: newName } : doc
        )
      );
      
      // If the current document is renamed, update it
      if (currentDoc && currentDoc.id === renamingDocId) {
        setCurrentDoc((prev) =>
          prev ? { ...prev, name: newName } : prev
        );
      }

      console.log(`Document renamed to: ${newName}`);
    } catch (error) {
      console.error('Failed to rename document:', error);
    }
  };

  // Handle delete document (open delete modal)
  const handleDeleteDoc = (docId, docName) => {
    setDeletingDocId(docId);
    setDeletingDocName(docName);
    setShowDeleteModal(true);
  };

  // Handle confirm delete document
  const handleConfirmDelete = async () => {
    if (!deletingDocId) return;

    setIsDeleting(true);
    try {
      await apiService.deleteDocument(deletingDocId);
      
      // Remove from documents list
      setDocuments((prev) =>
        prev.filter((doc) => doc.id !== deletingDocId)
      );

      // If the deleted document was currently selected, select another one
      if (selectedDocId === deletingDocId) {
        const remaining = documents.filter((doc) => doc.id !== deletingDocId);
        if (remaining.length > 0) {
          handleSelectDoc(remaining[0].id);
        } else {
          setSelectedDocId(null);
          setCurrentDoc(null);
        }
      }

      setShowDeleteModal(false);
      console.log(`Document ${deletingDocId} deleted successfully`);
    } catch (error) {
      console.error('Failed to delete document:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleChangeUserRole = async (targetUser, role) => {
    try {
      if (!currentRoomId || !targetUser.memberId) {
        return;
      }
      await apiService.updateMemberRole(currentRoomId, targetUser.memberId, role);
      await loadRoomUsers(currentRoomId);
    } catch (error) {
      console.error('Failed to update user role:', error);
    }
  };

  const handleRemoveUserAccess = async (targetUser) => {
    try {
      if (!currentRoomId || !targetUser.memberId) {
        return;
      }
      await apiService.removeMemberAccess(currentRoomId, targetUser.memberId);
      await loadRoomUsers(currentRoomId);
    } catch (error) {
      console.error('Failed to remove user access:', error);
    }
  };

  return (
    <div className="flex h-full min-h-0 overflow-hidden bg-background text-foreground">
      {/* Left Sidebar - Documents */}
      <DocumentList
        documents={documents}
        selectedDocId={selectedDocId}
        onSelectDoc={handleSelectDoc}
        onCreateNew={handleCreateNew}
        onEditDoc={handleEditDoc}
        onDeleteDoc={handleDeleteDoc}
      />

      {/* Center Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Toolbar */}
        <EditorToolbar
          onSave={handleSave}
          onLogsToggle={() => setShowLogs(!showLogs)}
          onInvite={() => setShowInviteModal(true)}
          logsOpen={showLogs}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Document Editor */}
          <div className="flex-1 flex flex-col min-w-0 min-h-0">
            {currentDoc && (
              <CodeEditor
                content={currentDoc.content}
                onChange={handleCodeChange}
                readOnly={currentRole === 'viewer'}
              />
            )}

            {!currentDoc && (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Select or create a document to start editing.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Sidebar - Logs or Users */}
      <div className="w-72 bg-card border-l border-border flex flex-col overflow-hidden relative">
        {/* Logs Panel - slides in from right */}
        <div className={`absolute inset-0 transition-all duration-300 ease-in-out flex flex-col overflow-y-auto ${
          showLogs ? 'translate-x-0 opacity-100 pointer-events-auto' : 'translate-x-full opacity-0 pointer-events-none'
        }`}>
          <LogsPanel logs={logs} onClose={() => setShowLogs(false)} isOpen={showLogs} />
        </div>

        {/* User List - slides out to right */}
        <div className={`absolute inset-0 transition-all duration-300 ease-in-out flex flex-col overflow-y-auto ${
          !showLogs ? 'translate-x-0 opacity-100 pointer-events-auto' : 'translate-x-full opacity-0 pointer-events-none'
        }`}>
          <UserList
            users={users}
            canManageRoles={currentRole === 'owner'}
            onChangeRole={handleChangeUserRole}
            onRemoveAccess={handleRemoveUserAccess}
            currentUserId={user?.userId}
          />
        </div>
      </div>

      {/* Invite Modal */}
      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInvite={handleSendInvite}
        docId={selectedDocId}
      />

      {/* Rename Modal */}
      <RenameModal
        isOpen={showRenameModal}
        onClose={() => setShowRenameModal(false)}
        currentName={renamingDocName}
        onRename={handleRenameDocument}
      />

      {/* Delete Modal */}
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        documentName={deletingDocName}
        isDeleting={isDeleting}
      />

      {/* Save Modal */}
      <SaveModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        documentName={currentDoc?.name}
        documentContent={currentDoc?.content}
      />
    </div>
  );
}
