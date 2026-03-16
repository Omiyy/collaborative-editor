# Quick Start Guide - Collaborative Code Editor Backend

## 🚀 Get Started in 5 Minutes

### 1️⃣ Start MongoDB (Choose One)

**Option A: Local MongoDB**
```bash
# Windows (if installed):
mongod

# Or using MongoDB service (Windows):
net start MongoDB
```

**Option B: MongoDB Atlas (Cloud)**
- Already have MongoDB URI from setup? Great! Skip to step 2.

### 2️⃣ Start Backend Server

```bash
cd backend
npm run dev
```

You should see:
```
╔════════════════════════════════════════╗
║   Collaborative Editor Backend Ready   ║
║   Running on Port: 8000                ║
║   Environment: dev                     ║
╚════════════════════════════════════════╝
```

### 3️⃣ Verify Server is Running

Open in browser:
```
http://localhost:8000/health
```

Should return: `{"status":"ok"}`

### 4️⃣ Test API with Postman/cURL

**Register a user:**
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Your Name",
    "email": "your@email.com",
    "password": "password123"
  }'
```

**Response should include a JWT token.**

### 5️⃣ Start Frontend (in another terminal)

```bash
cd frontend
npm run dev
```

Open: `http://localhost:5173`

---

## 🔧 Configuration

### Edit `.env` if needed:

```bash
# Backend port
PORT=8000

# MongoDB connection
MONGODB_URI=mongodb://localhost:27017/collaborative-editor

# JWT settings (change these!)
JWT_SECRET_KEY=your_super_secret_key_here
JWT_EXPIRE=7d

# Frontend URL for CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:5174
```

---

## 📊 Database Check

**View MongoDB collections:**

### Using MongoDB Compass (GUI)
1. Download: https://www.mongodb.com/products/compass
2. Connect to: `mongodb://localhost:27017`
3. Database: `collaborative-editor`
4. View collections: users, rooms, roommembers, codedocuments, activitylogs

### Using MongoDB Shell
```bash
mongosh

# Switch to database
use collaborative-editor

# View collections
show collections

# View users
db.users.find()

# View rooms
db.rooms.find()
```

---

## ✅ Full Integration Checklist

- [ ] MongoDB running (check with `mongosh`)
- [ ] Backend server running (`npm run dev` shows port 8000)
- [ ] Server responds to health check (`/health`)
- [ ] Can register user with POST `/api/auth/register`
- [ ] Can login with POST `/api/auth/login`
- [ ] Frontend running on port 5173
- [ ] Frontend login works (authenticates with backend)
- [ ] Can create/edit documents in frontend
- [ ] Documents save to MongoDB
- [ ] Backend logs show requests

---

## 🐛 Common Issues & Fixes

### ❌ "Cannot connect to MongoDB"
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Fix:** Start MongoDB with `mongod`

### ❌ "Port 8000 already in use"
```
Error: listen EADDRINUSE :::8000
```
**Fix:** Either kill the process or change PORT in `.env`

### ❌ "JWT secret is missing"
**Fix:** Add `JWT_SECRET_KEY=your_secret_key` to `.env`

### ❌ "CORS error on frontend"
```
Access to XMLHttpRequest blocked by CORS policy
```
**Fix:** Ensure `CORS_ORIGIN` in `.env` includes your frontend URL

### ❌ Server crashes on startup
**Fix:** Check `.env` syntax and MongoDB connection

---

## 📡 API Endpoints Reference

All requests (except login/register) need:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Get JWT token
- `GET /api/auth/current` - Current user info
- `POST /api/auth/logout` - Logout

### Documents
- `POST /api/documents` - Create
- `GET /api/documents` - List all
- `GET /api/documents/:docId` - Get one
- `PUT /api/documents/:docId` - Edit content
- `PATCH /api/documents/:docId/rename` - Rename
- `DELETE /api/documents/:docId` - Delete

### Rooms
- `POST /api/rooms` - Create room
- `GET /api/rooms` - List my rooms
- `GET /api/rooms/:roomId` - Get room details
- `GET /api/rooms/:roomId/members` - List members
- `POST /api/rooms/:roomId/members` - Add member
- `DELETE /api/rooms/:roomId/members/:memberId` - Remove member

---

## 🔗 Frontend Configuration

Make sure frontend `.env` has:
```
VITE_API_BASE_URL=http://localhost:8000/api
VITE_WS_URL=ws://localhost:8000
```

This tells frontend where to send API requests.

---

## 📝 Next Steps

1. **Data Verification** - Create user, room, document and check MongoDB
2. **Real-time Features** - WebSocket support ready in code
3. **Input Validation** - Consider adding more validation rules
4. **Error Handling** - Add custom error handlers if needed
5. **Testing** - Write API tests with Jest/Supertest
6. **Production** - Setup cloud hosting (Render, Railway, AWS)

---

## 💡 Pro Tips

✅ Use **Postman** to test APIs before connecting frontend  
✅ Use **MongoDB Compass** to visualize your database  
✅ Use **VS Code REST Client** extension to test right in editor  
✅ Keep `.env.example` updated when adding new variables  
✅ Never commit `.env` (it's in `.gitignore`)  

---

## 🎯 Success!

If you can:
1. Register a user from frontend
2. See user appear in MongoDB
3. Login and get JWT token
4. Create/edit/delete documents
5. See activity logs in MongoDB

**Then everything is working!** 🎉

---

For detailed docs, see [README.md](./README.md)
