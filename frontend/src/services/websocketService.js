// WebSocket service for real-time collaboration
import authService from './authService';

// Get WebSocket URL from environment variables
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.messageHandlers = [];
    this.roomId = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000; // 3 seconds
  }

  connect(roomId) {
    this.roomId = roomId;
    const token = authService.getToken();

    if (!token) {
      console.error('[WebSocket] Missing auth token. Aborting connection.');
      return;
    }

    console.log(`[WebSocket] Attempting to connect to room: ${roomId}`);
    console.log(`[WebSocket] URL: ${WS_URL}`);

    try {
      // Real WebSocket connection with token
      const wsUrl = `${WS_URL}?roomId=${roomId}&token=${token}`;
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log('[WebSocket] Connected successfully');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.emit('connected', { roomId, timestamp: Date.now() });
      };

      this.socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('[WebSocket] Received message:', message);
          const payload = message.data ?? message;
          this.emit(message.type, payload);
        } catch (error) {
          console.error('[WebSocket] Failed to parse message:', error);
        }
      };

      this.socket.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
        this.isConnected = false;
      };

      this.socket.onclose = () => {
        console.log('[WebSocket] Connection closed');
        this.isConnected = false;
        if (this.roomId) {
          this.attemptReconnect();
        }
      };
    } catch (error) {
      console.error('[WebSocket] Connection failed:', error);
      console.log('[WebSocket] Using fallback event emitter pattern');
      // Placeholder: Use event emitter pattern if WebSocket fails
      this.isConnected = true;
      this.emit('connected', { roomId, timestamp: Date.now() });
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `[WebSocket] Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      );
      setTimeout(() => {
        this.connect(this.roomId);
      }, this.reconnectDelay);
    } else {
      console.error('[WebSocket] Max reconnection attempts reached');
    }
  }

  disconnect() {
    if (this.socket) {
      this.roomId = null;
      this.socket.close();
    }
    this.isConnected = false;
    this.messageHandlers = [];
    console.log('[WebSocket] Disconnected');
  }

  safeSend(message) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return false;
    }

    try {
      this.socket.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('[WebSocket] Failed to send message:', error);
      return false;
    }
  }

  sendCodeUpdate(content) {
    if (!this.isConnected) {
      console.warn('[WebSocket] Not connected');
      return;
    }

    const message = {
      type: 'code_update',
      content,
      timestamp: Date.now(),
      roomId: this.roomId,
    };

    if (!this.safeSend(message)) {
      console.warn('[WebSocket] Skipped code update because socket is not open');
    }
    console.log('[WebSocket] Sending code update');
  }

  sendUserJoined(userData) {
    const message = {
      type: 'user_joined',
      user: userData,
      timestamp: Date.now(),
    };

    this.safeSend(message);
    console.log('[WebSocket] User joined');
  }

  sendUserLeft(userId) {
    const message = {
      type: 'user_left',
      userId,
      timestamp: Date.now(),
    };

    this.safeSend(message);
    console.log('[WebSocket] User left');
  }

  onMessage(callback) {
    this.messageHandlers.push(callback);
    return () => {
      this.messageHandlers = this.messageHandlers.filter((handler) => handler !== callback);
    };
  }

  emit(eventType, data) {
    this.messageHandlers.forEach((handler) => {
      try {
        handler({ type: eventType, data });
      } catch (error) {
        console.error('[WebSocket] Message handler error:', error);
      }
    });
  }
}

export default new WebSocketService();
