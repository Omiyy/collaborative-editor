require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const documentRoutes = require('./routes/documentRoutes');
const roomRoutes = require('./routes/roomRoutes');
const activityRoutes = require('./routes/activityRoutes');
const inviteRoutes = require('./routes/inviteRoutes');
const { verifyToken, getJwtSecret } = require('./utils/jwt');

const app = express();
const server = http.createServer(app);

const ensureRequiredEnv = () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('Missing MONGODB_URI environment variable.');
  }

  // Force secret validation at startup to fail fast in misconfigured deploys.
  getJwtSecret();
};

ensureRequiredEnv();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// CORS Configuration
const normalizeOrigin = (origin = '') => origin.trim().replace(/\/$/, '');

const configuredOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => normalizeOrigin(origin))
  .filter(Boolean);

const isOriginAllowed = (requestOrigin) => {
  const origin = normalizeOrigin(requestOrigin);
  if (!origin) return true;

  return configuredOrigins.some((allowedOrigin) => {
    // Support wildcard patterns like https://*.vercel.app
    if (allowedOrigin.includes('*')) {
      const escaped = allowedOrigin
        .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
        .replace(/\*/g, '.*');
      return new RegExp(`^${escaped}$`).test(origin);
    }
    return allowedOrigin === origin;
  });
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.set('trust proxy', 1);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Server is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/documents', activityRoutes);
app.use('/api/invites', inviteRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// WebSocket Server Setup
const wss = new WebSocket.Server({ server });
const rooms = new Map(); // Store active rooms and their clients

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const token = url.searchParams.get('token');
  const roomId = url.searchParams.get('roomId');

  console.log(`[WebSocket] New connection attempt - Room: ${roomId}`);

  // Verify JWT token
  if (!token) {
    console.error('[WebSocket] No token provided');
    ws.close(1008, 'Unauthorized');
    return;
  }

  if (!roomId) {
    console.error('[WebSocket] No roomId provided');
    ws.close(1008, 'Room is required');
    return;
  }

  try {
    const decoded = verifyToken(token);
    const userId = decoded.userId;
    const userName = decoded.name || 'Anonymous';

    // Add user to room
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
    rooms.get(roomId).add(ws);

    // Attach metadata to socket
    ws.userId = userId;
    ws.userName = userName;
    ws.roomId = roomId;

    console.log(`[WebSocket] ✓ User ${userName} (${userId}) connected to room ${roomId}`);

    // Notify others that user joined
    broadcast(roomId, {
      type: 'user_joined',
      userId,
      userName,
      timestamp: Date.now(),
    }, ws);

    // Handle incoming messages
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        console.log(`[WebSocket] Message from ${userName}:`, message.type);

        // Broadcast to all users in room
        broadcast(roomId, {
          ...message,
          userId,
          userName,
          timestamp: Date.now(),
        }, ws);
      } catch (error) {
        console.error('[WebSocket] Failed to parse message:', error);
      }
    });

    // Handle disconnection
    ws.on('close', () => {
      console.log(`[WebSocket] User ${userName} disconnected from room ${roomId}`);
      const roomClients = rooms.get(roomId);
      if (roomClients) {
        roomClients.delete(ws);
        if (roomClients.size === 0) {
          rooms.delete(roomId);
        }
      }

      // Notify others that user left
      broadcast(roomId, {
        type: 'user_left',
        userId,
        userName,
        timestamp: Date.now(),
      });
    });
  } catch (error) {
    console.error('[WebSocket] Token verification failed:', error);
    ws.close(1008, 'Unauthorized');
  }
});

// Helper function to broadcast messages to all users in a room
function broadcast(roomId, message, senderWs = null) {
  const roomClients = rooms.get(roomId);
  if (!roomClients) return;

  const data = JSON.stringify(message);
  roomClients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client !== senderWs) {
      client.send(data);
    }
  });
}

// Start server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║      Collab Edito Backend Ready        ║
║   Running on Port: ${PORT.toString().padEnd(26)}║
║   Environment: ${process.env.NODE_ENV?.padEnd(26)}║
║   WebSocket: ws://localhost:${PORT}                ║
╚════════════════════════════════════════╝
  `);
});

module.exports = app;
