# Complete Feature Testing Guide

## Setup Status
- ✅ Backend running on port 8000
- ✅ Frontend running on port 5173
- ✅ MongoDB connected
- ✅ WebSocket support enabled
- ✅ Invite system implemented

## Testing Checklist

### 1. USER REGISTRATION & LOGIN
**Test Case 1.1: Register First User**
- Go to http://localhost:5173/login
- Switch to Register tab
- Enter:
  - Name: Alice
  - Email: alice@example.com
  - Password: password123
  - Confirm: password123
- Click Register
- Expected: Should redirect to /editor page and see "Personal Documents"

**Test Case 1.2: Login with Registered User**
- Logout (if already logged in)
- Go to http://localhost:5173/login
- Enter email: alice@example.com
- Enter password: password123
- Click Login
- Expected: Should redirect to /editor page

### 2. DOCUMENT CREATION & EDITING
**Test Case 2.1: Create New Document**
- Go to /editor
- Click "Create New" button in left panel
- Enter document name in modal
- Click Create
- Expected: Document appears in list and opens in editor

**Test Case 2.2: Edit Document**
- Select a document
- Type code in Monaco editor
- Press Ctrl+S or click Save
- Expected: Code is saved successfully

### 3. USER INVITATION
**Test Case 3.1: Invite Another User**
- Prerequisites: Have 2 registered users (alice@example.com registered, create bob@example.com)
- Logged in as Alice, open any document
- Click "Invite" button in toolbar
- Enter bob@example.com
- Select role: Editor
- Click Send Invite
- Expected: "Invite sent successfully" message, no errors

**Test Case 3.2: Accept Invite & See Document**
- Log out (Logout Alice)
- Login as Bob (bob@example.com / password123)
- Bob should now see Alice's document in the document list
- Click to open the shared document
- Expected: Bob can see and edit the document

### 4. SHARE LINK FUNCTIONALITY
**Test Case 4.1: Generate Share Link**
- While logged in as Alice, open a document
- Look for "Copy Link" or share button (after implementation)
- Click to generate link
- Expected: Share link is generated and copied to clipboard

**Test Case 4.2: Join via Share Link**
- Log out from current user
- Copy the share link URL
- Paste in browser
- Expected: Auto-joins the document if not already a member

### 5. REAL-TIME COLLABORATION
**Test Case 5.1: Live Code Updates**
- Requirements: Have 2 browser windows/tabs
- Window 1: Logged in as Alice, open document
- Window 2: Logged in as Bob, same document open
- In Window 1: Type code in editor
- Expected: Code appears in real-time in Window 2

**Test Case 5.2: Live User List**
- Requirements: 2 users in same document
- Window 1: Look at right panel (User List)
- Window 2: Look at right panel (User List)
- Expected: Both windows show connected users updating in real-time

### 6. PERMISSIONS & ACCESS CONTROL
**Test Case 6.1: Viewer Role Restriction**
- Invite a user as "Viewer"
- Log in as that user
- Try to edit the document
- Expected: User cannot modify code (editor disabled or error)

**Test Case 6.2: Editor Role Access**
- Invite a user as "Editor"
- Log in as that user
- Try to edit the document
- Expected: User can modify code successfully

### 7. ACTIVITY LOGS
**Test Case 7.1: View Activity**
- Open a document where edits have been made
- Click "Logs" button
- Expected: List of activities (created, edited, etc.) with timestamps

### 8. MULTI-USER SYNCHRONIZATION
**Test Case 8.1: Simultaneous edits**
- 3 users in same document
- Each types different code sections simultaneously
- Expected: No conflicts, all changes visible to all users

---

## Quick Testing Script

### Create Test Users via Terminal
```bash
# Terminal 1: Start backend
cd backend && npm run dev

# Terminal 2: Test with curl (or use Postman)
# Register first user
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice",
    "email": "alice@example.com",
    "password": "password123"
  }'

# Register second user
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bob",
    "email": "bob@example.com",
    "password": "password123"
  }'
```

---

## Feature Implementation Status

### Core Features
- [x] User Registration
- [x] User Login
- [x] Document CRUD
- [x] User Authentication & JWT
- [x] Invite System (Backend)
- [ ] Invite System (Frontend UI improvements needed)
- [x] Share Link Generation
- [ ] Copy Link Button (UI improvement needed)
- [x] WebSocket Real-time Updates
- [x] User List in Real-time
- [x] Activity Logging

### Known Issues & Fixes Applied
1. ✅ Added inviteRoutes to server.js
2. ✅ Updated RoomMember model with invite fields
3. ✅ Created inviteController with all necessary methods
4. ✅ Updated apiService to call correct endpoints

### Next Steps for UI Completeness
1. Add "Copy Link" button to EditorToolbar
2. Add link copy functionality with clipboard notification
3. Improve Invite Modal UI feedback
4. Add invite list/notifications component

---
