# Frontend-Backend Integration Guide

Complete guide to connect React frontend with Express backend.

---

## Architecture Overview

```
Frontend (React)                    Backend (Express)
┌──────────────────┐              ┌──────────────────┐
│ React Component  │─────HTTP────→│ Express Routes   │
│                  │              │ (Port 8000)      │
│ (Port 5173+)     │←────JSON─────│                  │
│                  │              │ MongoDB          │
│ Axios Instance   │              └──────────────────┘
│ + JWT Token      │
└──────────────────┘
```

---

## Current Status

### Frontend ✅
- React with Vite
- Axios HTTP client configured
- JWT token management with js-cookie
- AuthContext for state management
- All components ready
- `.env` file with `VITE_API_BASE_URL`

### Backend ✅
- Express server on port 8000
- MongoDB models ready
- JWT authentication middleware
- All API routes implemented
- CORS configured for frontend
- `.env` file with configuration

---

## Step 1: Ensure MongoDB is Running

### Local MongoDB:
```bash
mongod
```

### MongoDB Atlas:
Already connected via `MONGODB_URI` in `.env`

**Verify connection:**
```bash
mongosh
show dbs
```

---

## Step 2: Check Backend Configuration

### Backend `.env` file (`backend/.env`):
```
PORT=8000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/collaborative-editor
JWT_SECRET=your_secret_key_change_in_production
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176
SESSION_SECRET=session_secret_key
```

**Key Settings:**
- `PORT=8000` - Backend runs on port 8000
- `CORS_ORIGIN` - Includes all frontend dev ports
- `JWT_SECRET` - Change this to a strong key

---

## Step 3: Start Backend Server

```bash
cd backend
npm run dev
```

**Expected output:**
```
╔════════════════════════════════════════╗
║   Collaborative Editor Backend Ready   ║
║   Running on Port: 8000                ║
║   Environment: development             ║
╚════════════════════════════════════════╝
```

**Verify it's running:**
```bash
curl http://localhost:8000/health
```

Response should be: `{"status":"ok"}`

---

## Step 4: Check Frontend Configuration

### Frontend `.env` file (`frontend/.env`):
```
VITE_API_BASE_URL=http://localhost:8000/api
VITE_WS_URL=ws://localhost:8001/ws
```

**Verify Axios instance** in `frontend/src/services/axiosInstance.js`:
```javascript
import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = import.meta.env.VITE_API_BASE_BASE_URL || 'http://localhost:8000/api';

const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor - adds JWT token
instance.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;
```

---

## Step 5: Start Frontend Server

In another terminal:
```bash
cd frontend
npm run dev
```

**Expected output:**
```
  VITE v5.0.11  ready in 123 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

---

## Step 6: Test Integration

### Open Browser
```
http://localhost:5173
```

### Should see:
- Login page (if not authenticated)
- Navigation bar
- All UI components

---

## Step 7: Test Authentication Flow

### 1️⃣ Register New User
```
Email: testuser@example.com
Password: password123
Name: Test User
```

**Behind the scenes:**
1. Frontend sends POST to `http://localhost:8000/api/auth/register`
2. Backend receives request
3. Password is hashed with bcryptjs
4. User saved to MongoDB
5. JWT token generated
6. Token returned to frontend
7. Frontend stores token in cookies
8. Frontend redirects to editor page

**Verify in MongoDB:**
```bash
mongosh
use collaborative-editor
db.users.find()
```

You should see your user!

### 2️⃣ Login
```
Email: testuser@example.com
Password: password123
```

**Behind the scenes:**
1. Frontend sends POST to `http://localhost:8000/api/auth/login`
2. Backend verifies email and password
3. JWT token generated
4. Token sent to frontend
5. Frontend stores token and navigates to editor

**Verify token in Storage:**
1. Open DevTools (F12)
2. Go to Application → Cookies
3. Look for `token` cookie
4. Should contain JWT (long string starting with `eyJ...`)

---

## Step 8: Test Document Creation

### Create Room First
1. Click "Create Room" or similar button
2. Enter room name: "Test Room"
3. Click Create

**Verify in MongoDB:**
```bash
mongosh
use collaborative-editor
db.rooms.find()
```

### Create Document
1. In the room, click "Create Document"
2. Enter document name: "Test Document"
3. Enter some code
4. Click Save

**Verify in MongoDB:**
```bash
db.codedocuments.find()
db.activitylogs.find()
```

---

## Frontend API Usage Examples

### Using Axios Service

**In React Component:**
```javascript
import axiosInstance from '../services/axiosInstance';
import { useEffect, useState } from 'react';

function MyComponent() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await axiosInstance.get('/documents');
        setDocuments(response.data.documents);
      } catch (error) {
        console.error('Error fetching documents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  // ... rest of component
}
```

### Create Document
```javascript
const createDocument = async (name, content, roomId) => {
  try {
    const response = await axiosInstance.post('/documents', {
      name,
      content,
      roomId,
      language: 'javascript'
    });
    return response.data.document;
  } catch (error) {
    console.error('Error creating document:', error);
  }
};
```

### Update Document
```javascript
const updateDocument = async (docId, content) => {
  try {
    const response = await axiosInstance.put(`/documents/${docId}`, {
      content
    });
    return response.data.document;
  } catch (error) {
    console.error('Error updating document:', error);
  }
};
```

### Delete Document
```javascript
const deleteDocument = async (docId) => {
  try {
    const response = await axiosInstance.delete(`/documents/${docId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting document:', error);
  }
};
```

---

## Network Debugging

### Open DevTools (F12)
1. Go to Network tab
2. Perform action (e.g., login)
3. Look for requests to `localhost:8000`

### Check Request Details
- **URL:** Should show full endpoint
- **Status:** Should be 200/201 for success
- **Headers:** Should include `Authorization: Bearer ...`
- **Response:** Should show JSON data

### Check Console for Errors
- Any red errors
- CORS errors indicate misconfiguration
- 401 errors indicate token issues

---

## Environment Variables Checklist

### Backend `.env` ✅
- [ ] `PORT=8000`
- [ ] `MONGODB_URI` points to valid MongoDB
- [ ] `JWT_SECRET` is set
- [ ] `CORS_ORIGIN` includes frontend URLs
- [ ] `NODE_ENV=development`

### Frontend `.env` ✅
- [ ] `VITE_API_BASE_URL=http://localhost:8000/api`
- [ ] `VITE_WS_URL=ws://localhost:8001/ws` (optional, for WebSocket)

---

## Common Issues & Solutions

### ❌ CORS Error
```
Access to XMLHttpRequest from origin 'http://localhost:5173' 
has been blocked by CORS policy
```

**Solution:**
1. Check `CORS_ORIGIN` in `backend/.env`
2. Ensure it includes `http://localhost:5173`
3. Restart backend: `npm run dev`

### ❌ 404 Not Found
```
POST http://localhost:8000/api/auth/login 404 (Not Found)
```

**Causes:**
- Backend not running
- Wrong port (check if really on 8000)
- Route not defined

**Solution:**
1. Ensure backend is running: `npm run dev`
2. Check if `http://localhost:8000/health` works
3. Verify routes in `src/routes/`

### ❌ 401 Unauthorized
```
Error: 401 - "Token expired or invalid"
```

**Causes:**
- JWT token missing
- Token expired (7 days by default)
- Token tampered

**Solution:**
1. Clear cookies and log in again
2. Check if token is being sent: DevTools → Network → Headers
3. Restart both frontend and backend

### ❌ MongoDB Connection
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:**
1. Start MongoDB: `mongod`
2. Or update `MONGODB_URI` to MongoDB Atlas connection
3. Verify connection: `mongosh`

### ❌ Token Not Being Sent
**Check:**
1. Is token in cookies? (DevTools → Application → Cookies)
2. Is Axios interceptor working?
3. Check browser console for errors

---

## Testing Flow

### 1. Register & Login
```
Frontend: Fill login form
↓
Axios: POST /api/auth/register
↓
Backend: Hash password, save user
↓
MongoDB: User document created
↓
Backend: Generate JWT, return token
↓
Frontend: Store JWT, redirect
```

### 2. Create Room
```
Frontend: Enter room name, click create
↓
Axios: POST /api/rooms (with token)
↓
Backend: Create room, add current user as owner
↓
MongoDB: Room document created
↓
Backend: Return room data
↓
Frontend: Display room
```

### 3. Create Document
```
Frontend: Enter document name
↓
Axios: POST /api/documents (with token)
↓
Backend: Create document in room
↓
MongoDB: Document created, activity log added
↓
Backend: Return document
↓
Frontend: Display in editor with Monaco
```

### 4. Edit & Save
```
Frontend: Type in Monaco Editor
↓
Axios: PUT /api/documents/:id (with token)
↓
Backend: Update content, increment version
↓
MongoDB: Document updated, activity log added
↓
Backend: Confirm success
↓
Frontend: Show save indicator
```

---

## Performance Tips

1. **Cache Documents** - Store fetched docs in state to reduce requests
2. **Debounce Saves** - Wait 1-2 seconds after typing before saving
3. **Lazy Load** - Load documents on demand, not all at once
4. **Use Fragments** - Only fetch needed fields from backend
5. **Optimize Images** - Use WebP, compress avatars

---

## Security Considerations

✅ **JWT in Secure Cookies** - HttpOnly flag prevents XSS attacks  
✅ **Password Hashing** - bcryptjs with 10 salt rounds  
✅ **CORS Configured** - Only allows specified origins  
✅ **Token Expiry** - 7 days default, user must re-login  
✅ **HTTPS in Production** - Use SSL/TLS certificates  
✅ **Input Validation** - Server validates all inputs  

---

## Next Steps

1. ✅ Test the complete flow above
2. ✅ Verify all API endpoints work
3. ✅ Check MongoDB collections are populated
4. ✅ Test with multiple users
5. ✅ Implement real-time WebSocket features
6. ✅ Add more validation and error handling
7. ✅ Setup production deployment

---

## Useful Commands

### Backend
```bash
# Development
cd backend && npm run dev

# Production
cd backend && npm start

# Check logs
npm run dev  # Shows console output
```

### Frontend
```bash
# Development
cd frontend && npm run dev

# Build
cd frontend && npm run build

# Preview production build
cd frontend && npm run preview
```

### MongoDB
```bash
# Start MongoDB
mongod

# Connect to database
mongosh mongodb://localhost:27017/collaborative-editor

# View collections
show collections

# View users
db.users.find()

# View rooms
db.rooms.find()

# View documents
db.codedocuments.find()

# Delete all users (cleanup)
db.users.deleteMany({})
```

---

For more details:
- Backend: [README.md](./backend/README.md)
- Backend API: [API_DOCS.md](./backend/API_DOCS.md)
- Quick Start: [QUICK_START.md](./backend/QUICK_START.md)
- Frontend: [Frontend README] (if available)
