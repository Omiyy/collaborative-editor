// API service using Axios
// JWT token is automatically added to all requests via axios interceptor
import axiosInstance from './axiosInstance';

let lastMembersNetworkErrorLogAt = 0;

const apiService = {
  // ==================== DOCUMENTS ====================

  async createDocument(name) {
    try {
      const response = await axiosInstance.post('/documents', {
        name,
      });
      const document = response.data?.data || response.data;
      // Map _id to id for consistency
      return {
        id: document._id || document.id,
        name: document.name,
        content: document.content || '// Start coding...\n',
        createdAt: document.createdAt || new Date(),
        room: document.room,
        roomId: typeof document.room === 'object' ? document.room?._id : document.room,
      };
    } catch (error) {
      console.error('Create document error:', error);
      throw error;
    }
  },

  async getDocument(docId) {
    try {
      const response = await axiosInstance.get(`/documents/${docId}`);
      const document = response.data?.data || response.data;
      return {
        id: document._id || document.id || docId,
        name: document.name,
        content: document.content || '// Start coding...\n',
        createdAt: document.createdAt,
        room: document.room,
        roomId: typeof document.room === 'object' ? document.room?._id : document.room,
      };
    } catch (error) {
      console.error(`Fetch document error: ${docId}`, error);
      throw error;
    }
  },

  async updateDocument(docId, content) {
    try {
      const response = await axiosInstance.put(`/documents/${docId}`, {
        content,
      });
      const document = response.data?.data || response.data;
      return {
        id: document._id || document.id || docId,
        name: document.name,
        content: document.content,
        success: true,
      };
    } catch (error) {
      console.error(`Update document error: ${docId}`, error);
      throw error;
    }
  },

  async deleteDocument(docId) {
    try {
      const response = await axiosInstance.delete(`/documents/${docId}`);
      return response.data || { success: true };
    } catch (error) {
      console.error(`Delete document error: ${docId}`, error);
      throw error;
    }
  },

  async renameDocument(docId, newName) {
    try {
      const response = await axiosInstance.patch(`/documents/${docId}/rename`, {
        name: newName,
      });
      const document = response.data?.data || response.data;
      return {
        id: document._id || document.id || docId,
        name: document.name,
        success: true,
      };
    } catch (error) {
      console.error(`Rename document error: ${docId}`, error);
      throw error;
    }
  },

  async listDocuments() {
    try {
      const response = await axiosInstance.get('/documents');
      const documents = response.data?.data || response.data || [];
      // Map _id to id for all documents
      return Array.isArray(documents) 
        ? documents.map((doc) => ({
            id: doc._id || doc.id,
            name: doc.name,
            content: doc.content || '// Start coding...\n',
            createdAt: doc.createdAt,
            room: doc.room,
            roomId: typeof doc.room === 'object' ? doc.room?._id : doc.room,
          }))
        : [];
    } catch (error) {
      console.error('List documents error:', error);
      throw error;
    }
  },

  // ==================== USERS ====================

  async getCurrentUser() {
    try {
      const response = await axiosInstance.get('/auth/current');
      return response.user || response.data || response;
    } catch (error) {
      console.error('Get current user error:', error);
      // Placeholder
      return {
        id: 'user-1',
        name: 'You',
        email: 'user@example.com',
        role: 'editor',
      };
    }
  },

  async getUsersInRoom(roomId) {
    try {
      const response = await axiosInstance.get(`/rooms/${roomId}/members`);
      const members = response.data || [];
      if (!Array.isArray(members)) {
        return [];
      }

      return members.map((member) => ({
        id: member.user?._id || member.user?.id || member._id,
        memberId: member._id,
        name: member.user?.name || 'Unknown User',
        email: member.user?.email || 'unknown@example.com',
        role: member.role || 'viewer',
      }));
    } catch (error) {
      const isNetworkError = error?.message === 'Network Error' || !error?.status;
      if (isNetworkError) {
        const now = Date.now();
        if (now - lastMembersNetworkErrorLogAt > 10000) {
          console.warn(`Get users in room skipped (backend unreachable): ${roomId}`);
          lastMembersNetworkErrorLogAt = now;
        }
      } else {
        console.error(`Get users in room error: ${roomId}`, error);
      }
      return [];
    }
  },

  async joinRoom(roomId) {
    try {
      const response = await axiosInstance.post(`/rooms/${roomId}/members`, {});
      return response.data || response;
    } catch (error) {
      console.error(`Join room error: ${roomId}`, error);
      throw error;
    }
  },

  async updateMemberRole(roomId, memberId, role) {
    try {
      const response = await axiosInstance.patch(`/rooms/${roomId}/members/${memberId}/role`, {
        role,
      });
      return response.data || response;
    } catch (error) {
      console.error('Update member role error:', error);
      throw error;
    }
  },

  async removeMemberAccess(roomId, memberId) {
    try {
      const response = await axiosInstance.delete(`/rooms/${roomId}/members/${memberId}`);
      return response.data || response;
    } catch (error) {
      console.error('Remove member access error:', error);
      throw error;
    }
  },

  // ==================== INVITES ====================

  async sendInvite(email, docId, role) {
    try {
      const response = await axiosInstance.post('/invites/send', {
        email,
        docId,
        role,
      });
      return response.data || response;
    } catch (error) {
      console.error('Send invite error:', error);
      throw error;
    }
  },

  async generateShareLink(docId) {
    try {
      const response = await axiosInstance.post('/invites/share-link', {
        docId,
        expiresIn: 30,
      });
      return response.data?.data || response.data || response;
    } catch (error) {
      console.error('Generate share link error:', error);
      throw error;
    }
  },

  async joinWithInviteCode(code, docId) {
    try {
      const response = await axiosInstance.post('/invites/join', {
        code,
        docId,
      });
      return response.data || response;
    } catch (error) {
      console.error('Join with invite code error:', error);
      throw error;
    }
  },

  async getInvites() {
    try {
      const response = await axiosInstance.get('/invites/my-invites');
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error('Get invites error:', error);
      return [];
    }
  },

  // ==================== ACTIVITY LOGS ====================

  async getActivityLogs(docId) {
    try {
      const response = await axiosInstance.get(`/documents/${docId}/logs`);
      const logs = response.data || [];
      if (!Array.isArray(logs)) {
        return [];
      }

      return logs.map((log) => ({
        id: log._id || log.id,
        user: log.user?.name || 'Unknown User',
        action: log.description || log.action || 'updated document',
        timestamp: log.createdAt || log.timestamp || new Date(),
      }));
    } catch (error) {
      console.error(`Get activity logs error: ${docId}`, error);
      return [];
    }
  },

  async logActivity(docId, action) {
    try {
      const response = await axiosInstance.post(`/documents/${docId}/logs`, {
        action,
        description: action,
      });
      return response.data || response;
    } catch (error) {
      console.error(`Log activity error: ${docId}`, error);
      throw error;
    }
  },
};

export default apiService;
