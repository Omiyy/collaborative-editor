# Deployment & Verification Checklist

Complete checklist to verify your Collaborative Code Editor is working correctly.

---

## 📋 Pre-Launch Checklist

### Prerequisites
- [ ] Node.js v14+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Git installed (optional, but recommended)
- [ ] MongoDB running (local or Atlas connection string ready)
- [ ] Text editor/IDE (VS Code recommended)

### Environment Setup
- [ ] Backend `.env` file exists with all required variables
- [ ] Frontend `.env` file exists with API URL
- [ ] Both `.env` files are NOT committed to git
- [ ] `.gitignore` includes `.env` files

**Backend `.env` Checklist:**
- [ ] `PORT=8000` (or your chosen port)
- [ ] `NODE_ENV=development` (for dev)
- [ ] `MONGODB_URI` is set (local or Atlas)
- [ ] `JWT_SECRET` is set (change in production)
- [ ] `CORS_ORIGIN` includes frontend URLs
- [ ] `SESSION_SECRET` is set

**Frontend `.env` Checklist:**
- [ ] `VITE_API_BASE_URL=http://localhost:8000/api`
- [ ] `VITE_WS_URL=ws://localhost:8001/ws` (optional)

---

## 🔧 Installation Checklist

### Backend Installation
```bash
cd backend
npm install
```
- [ ] No npm errors during install
- [ ] `node_modules` folder created (126 packages)
- [ ] `package-lock.json` generated
- [ ] All dependencies installed:
  ```bash
  # Verify key packages:
  npm list express
  npm list mongoose
  npm list jsonwebtoken
  ```

### Frontend Installation
```bash
cd frontend
npm install
```
- [ ] No npm errors during install
- [ ] `node_modules` folder created (100+ packages)
- [ ] `package-lock.json` generated
- [ ] Vite and React installed:
  ```bash
  npm list react
  npm list vite
  ```

---

## 🚀 Launch Checklist

### MongoDB Service
- [ ] MongoDB is running
  ```bash
  # Windows Service:
  Get-Service MongoDB
  
  # Or connect with mongosh:
  mongosh
  ```
- [ ] Connection successful (no errors)
- [ ] Can see `collaborative-editor` database (or will create on first write)

### Start Backend Server

```bash
cd backend
npm run dev
```

**Verification:**
- [ ] No startup errors
- [ ] Port 8000 is listening:
  ```
  ╔════════════════════════════════════════╗
  ║   Collaborative Editor Backend Ready   ║
  ║   Running on Port: 8000                ║
  ║   Environment: development             ║
  ╚════════════════════════════════════════╝
  ```
- [ ] No port 8000 in use errors
- [ ] Health check works:
  ```bash
  curl http://localhost:8000/health
  # Response: {"status":"ok"}
  ```
- [ ] CORS configured correctly
- [ ] MongoDB connection established (check logs)

### Start Frontend Server

In a new terminal:
```bash
cd frontend
npm run dev
```

**Verification:**
- [ ] No startup errors
- [ ] Dev server is running:
  ```
  ➜  Local:   http://localhost:5173/
  ```
- [ ] No port conflicts
- [ ] Hot reload is enabled
- [ ] VITE_API_BASE_URL loaded correctly

---

## ✅ Functional Testing

### Test 1: Health Check
```bash
curl http://localhost:8000/health
```
- [ ] Returns: `{"status":"ok"}`
- [ ] HTTP status: 200

### Test 2: User Registration
Using Postman or cURL:
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "testpass123"
  }'
```

**Expected Response (201):**
```json
{
  "success": true,
  "token": "eyJ...",
  "user": {
    "_id": "507f...",
    "name": "Test User",
    "email": "test@example.com"
  }
}
```

- [ ] Returns status 201
- [ ] User object in response
- [ ] JWT token in response
- [ ] Token is valid string (starts with `eyJ`)

### Test 3: User Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123"
  }'
```

- [ ] Returns status 200
- [ ] JWT token received (save for next tests)
- [ ] User data returned

### Test 4: Get Current User
```bash
curl -X GET http://localhost:8000/api/auth/current \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

- [ ] Returns status 200
- [ ] Current user data returned
- [ ] Matches logged-in user

### Test 5: Create Room
```bash
curl -X POST http://localhost:8000/api/rooms \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Room",
    "description": "Testing room creation"
  }'
```

- [ ] Returns status 201
- [ ] Room object with _id
- [ ] Owner is current user
- [ ] Status is "active"

### Test 6: Create Document
```bash
curl -X POST http://localhost:8000/api/documents \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "test.js",
    "content": "console.log('hello');",
    "roomId": "YOUR_ROOM_ID",
    "language": "javascript"
  }'
```

- [ ] Returns status 201
- [ ] Document object with _id
- [ ] Content matches
- [ ] Room association correct

### Test 7: Database Verification

```bash
mongosh
use collaborative-editor
show collections
db.users.find()
db.rooms.find()
db.codedocuments.find()
```

- [ ] `users` collection exists with your test user
- [ ] `rooms` collection has test room
- [ ] `codedocuments` collection has test document
- [ ] All relationships are correct

---

## 🌐 Frontend Testing

### Test 8: Open Application
Open browser: `http://localhost:5173`

- [ ] Page loads without errors
- [ ] No console errors (F12 → Console)
- [ ] Navbar visible
- [ ] Login page visible

### Test 9: Frontend Registration
In browser:
1. Enter name: "Frontend Test"
2. Enter email: "frontend@test.com"
3. Enter password: "test123"
4. Click Register

**Expectations:**
- [ ] No JavaScript errors
- [ ] Request sent to backend (F12 → Network)
- [ ] Response status 201
- [ ] Redirects to editor page
- [ ] Token stored in cookies (F12 → Application → Cookies)

### Test 10: Frontend Login
1. Enter email: "frontend@test.com"
2. Enter password: "test123"
3. Click Login

**Expectations:**
- [ ] No errors
- [ ] Redirects to editor
- [ ] Navbar shows username
- [ ] Can see room/document UI

### Test 11: Create Room in Frontend
1. Click "Create New Room" button
2. Enter name and description
3. Click Create

**Expectations:**
- [ ] UI updates with new room
- [ ] Network request to POST /api/rooms
- [ ] Database updated (verify with mongosh)
- [ ] No error messages

### Test 12: Create Document in Frontend
1. Select room
2. Click "Create Document"
3. Enter name and some code
4. Click Save

**Expectations:**
- [ ] Document appears in list
- [ ] Monaco editor loads with code
- [ ] Network shows POST /api/documents
- [ ] ActivityLog created in MongoDB

### Test 13: Edit Document
1. Write code in editor
2. Click Save (or autosave)
3. Close and reopen document

**Expectations:**
- [ ] Code persists after save
- [ ] PUT request sent (Network tab)
- [ ] Version increments
- [ ] ActivityLog updated

### Test 14: Rename Document
1. Right-click document → Rename
2. Enter new name
3. Confirm

**Expectations:**
- [ ] Document name updates in list
- [ ] PATCH request to /documents/:id/rename
- [ ] ActivityLog shows rename action
- [ ] Old name preserved in history

### Test 15: Delete Document
1. Right-click document → Delete
2. Confirm

**Expectations:**
- [ ] Document removed from UI
- [ ] DELETE request sent
- [ ] Status set to "deleted" in DB (soft delete)
- [ ] ActivityLog shows deletion

### Test 16: Multiple Documents
1. Create 3 documents in same room
2. Edit each one
3. Switch between them

**Expectations:**
- [ ] All documents listed
- [ ] Content switches correctly
- [ ] Each has own state
- [ ] No data corruption

### Test 17: Theme Toggle
1. Click theme button (sun/moon icon)

**Expectations:**
- [ ] UI colors change
- [ ] Theme applies to Monaco editor
- [ ] Selection persists on refresh

### Test 18: Logs Panel
1. Edit documents
2. View activity logs

**Expectations:**
- [ ] Logs show all actions
- [ ] Timestamps are correct
- [ ] Users are identified
- [ ] Actions are clear

---

## 📊 Performance Checks

### Backend Performance
- [ ] Server responds in <100ms to requests
- [ ] No memory leaks (check with `npm audit`)
- [ ] No security vulnerabilities (check with `npm audit`)

```bash
cd backend
npm audit
```

### Frontend Performance
- [ ] Page load time <3 seconds
- [ ] Monaco editor loads quickly
- [ ] Switching documents is smooth
- [ ] No lag when typing

Check with DevTools → Performance tab

### Database Performance
- [ ] Queries return in <100ms
- [ ] No N+1 query issues
- [ ] Indexes are used (check with explain())

---

## 🔒 Security Checks

### Authentication Security
- [ ] Passwords are hashed in database:
  ```bash
  mongosh
  db.users.findOne()
  # password field should NOT be plaintext
  ```

- [ ] JWT tokens are not exposed in:
  - [ ] Network requests as query params
  - [ ] Logs or console
  - [ ] HTML source

- [ ] CORS configured properly:
  - [ ] Backend only accepts requests from frontend
  - [ ] No `*` wildcard (unless development)

- [ ] Token stored securely:
  - [ ] HttpOnly cookie (not accessible from JavaScript)
  - [ ] Secure flag set (HTTPS in production)

### Input Validation
- [ ] Cannot create user with blank email
- [ ] Cannot create user with short password
- [ ] Cannot inject script tags in document names
- [ ] SQL injection attempts fail (N/A for MongoDB)

### Authorization Checks
- [ ] Cannot access others' documents
- [ ] Cannot edit documents without permission
- [ ] Cannot delete documents you don't own
- [ ] Cannot invite users to rooms you don't own

---

## 📦 Dependency Checks

### Backend Dependencies
```bash
cd backend
npm outdated
```

- [ ] All packages installed
- [ ] No critical vulnerabilities:
  ```bash
  npm audit
  ```

**Key packages verified:**
- [ ] express: ^5.2.1
- [ ] mongoose: ^8.23.0
- [ ] jsonwebtoken: ^9.0.3
- [ ] bcryptjs: ^3.0.3

### Frontend Dependencies
```bash
cd frontend
npm outdated
```

- [ ] All packages installed
- [ ] React: ^19.2.4
- [ ] Vite: ^5.0.11
- [ ] Monaco Editor: ^4.5.0
- [ ] Axios: latest
- [ ] TailwindCSS: ^3.4.0

---

## 🗂️ File Structure Verification

### Backend Structure
- [ ] `backend/src/controllers/` - 4 controller files
- [ ] `backend/src/models/` - 5 model files
- [ ] `backend/src/routes/` - 4 route files
- [ ] `backend/src/middleware/` - auth.js middleware
- [ ] `backend/src/utils/` - jwt.js utilities
- [ ] `backend/src/config/` - db.js connection
- [ ] `backend/src/server.js` - Entry point
- [ ] `backend/.env` - Configuration file
- [ ] `backend/package.json` - Dependencies

### Frontend Structure
- [ ] `frontend/src/components/` - 11 components
- [ ] `frontend/src/pages/` - 2 pages
- [ ] `frontend/src/context/` - AuthContext
- [ ] `frontend/src/services/` - 4 services
- [ ] `frontend/.env` - API configuration
- [ ] `frontend/vite.config.js` - Vite config
- [ ] `frontend/tailwind.config.js` - TailwindCSS config

### Documentation
- [ ] `PROJECT_SUMMARY.md` - Project overview
- [ ] `INTEGRATION_GUIDE.md` - Frontend-backend guide
- [ ] `MONGODB_SETUP.md` - Database setup
- [ ] `backend/README.md` - Backend docs
- [ ] `backend/QUICK_START.md` - Quick start
- [ ] `backend/API_DOCS.md` - API reference

---

## 💾 Backup & Migration

### Create Backups
```bash
# Backup MongoDB locally
mongodump --db collaborative-editor --out ./backup/$(date +%Y%m%d)

# Export to JSON (single user test)
mongosh --eval "db.users.find().forEach(printjson)" > users.json
```

- [ ] Backup files created successfully
- [ ] Can restore from backup
- [ ] No data loss during backup

---

## 🎉 Final Sign-Off

### Developer Verification
- [ ] Code is clean and readable
- [ ] No console.log statements left in production code
- [ ] Error handling is comprehensive
- [ ] Comments explain complex logic
- [ ] No hardcoded values

### Functionality Verification
- [ ] All 18+ API endpoints working
- [ ] All 11+ frontend components functional
- [ ] Database models storing data correctly
- [ ] Authentication flow complete
- [ ] Authorization properly enforced

### Documentation Verification
- [ ] README files complete
- [ ] API documentation accurate
- [ ] Setup instructions clear
- [ ] Troubleshooting guide helpful
- [ ] Code comments helpful

### Testing Complete
- [ ] Manual testing passed
- [ ] Edge cases handled
- [ ] Error messages clear
- [ ] No unhandled errors
- [ ] Performance acceptable

---

## 📝 Sign-Off

**Date Completed:** ________________

**Tested By:** ________________

**Notes/Issues:** 
```


```

**Status:** ✅ Ready for Deployment / ⚠️ Issues Found / ❌ Not Ready

---

## 🚀 Post-Launch Checklist

### Week 1
- [ ] Monitor server logs
- [ ] Check database size
- [ ] Monitor user growth
- [ ] Collect user feedback

### Month 1
- [ ] Review performance metrics
- [ ] Update documentation
- [ ] Plan Phase 2 features (real-time, WebSocket)
- [ ] Schedule security audit

### Quarter 1
- [ ] Deploy to production
- [ ] Setup monitoring and alerting
- [ ] Plan feature roadmap
- [ ] Scale infrastructure if needed

---

**For Support:**
- Backend Setup: [README.md](./backend/README.md)
- API Details: [API_DOCS.md](./backend/API_DOCS.md)
- Integration: [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)
- MongoDB: [MONGODB_SETUP.md](./MONGODB_SETUP.md)

---

**Verification Complete!** ✅

Your Collaborative Code Editor is ready to use!
