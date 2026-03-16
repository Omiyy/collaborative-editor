# API Documentation - Collaborative Code Editor Backend

Complete API reference with examples for all endpoints.

---

## Base URL

```
http://localhost:8000/api
```

## Authentication

All endpoints (except `/auth/register` and `/auth/login`) require JWT token in header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Token is obtained from login response and should be sent in every authenticated request.

---

## 1. Authentication Endpoints

### Register New User
**POST** `/auth/register`

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (201):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": null,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Error (400):**
```json
{
  "success": false,
  "message": "Email already exists"
}
```

**cURL:**
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

---

### Login User
**POST** `/auth/login`

**Request:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": null,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Error (401):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

**cURL:**
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

---

### Get Current User
**GET** `/auth/current`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": null,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**cURL:**
```bash
curl -X GET http://localhost:8000/api/auth/current \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### Logout User
**POST** `/auth/logout`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 2. Document Endpoints

### Create Document
**POST** `/documents`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request:**
```json
{
  "name": "Hello World",
  "content": "console.log('Hello, World!');",
  "roomId": "507f1f77bcf86cd799439012",
  "language": "javascript"
}
```

**Response (201):**
```json
{
  "success": true,
  "document": {
    "_id": "507f1f77bcf86cd799439013",
    "name": "Hello World",
    "content": "console.log('Hello, World!');",
    "room": "507f1f77bcf86cd799439012",
    "createdBy": "507f1f77bcf86cd799439011",
    "language": "javascript",
    "version": 1,
    "status": "active",
    "createdAt": "2024-01-15T10:45:00Z"
  }
}
```

**cURL:**
```bash
curl -X POST http://localhost:8000/api/documents \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Hello World",
    "content": "console.log('\''Hello, World!'\'');",
    "roomId": "507f1f77bcf86cd799439012",
    "language": "javascript"
  }'
```

---

### List Documents
**GET** `/documents`

**Query Parameters:**
- `roomId` (optional) - Filter by room
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 10) - Items per page

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200):**
```json
{
  "success": true,
  "documents": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "name": "Hello World",
      "room": "507f1f77bcf86cd799439012",
      "createdBy": "507f1f77bcf86cd799439011",
      "language": "javascript",
      "version": 1,
      "status": "active",
      "createdAt": "2024-01-15T10:45:00Z"
    }
  ],
  "total": 1,
  "page": 1
}
```

**cURL:**
```bash
curl -X GET "http://localhost:8000/api/documents?roomId=507f1f77bcf86cd799439012" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### Get Single Document
**GET** `/documents/:docId`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200):**
```json
{
  "success": true,
  "document": {
    "_id": "507f1f77bcf86cd799439013",
    "name": "Hello World",
    "content": "console.log('Hello, World!');",
    "room": "507f1f77bcf86cd799439012",
    "createdBy": "507f1f77bcf86cd799439011",
    "language": "javascript",
    "version": 1,
    "status": "active",
    "createdAt": "2024-01-15T10:45:00Z",
    "updatedAt": "2024-01-15T10:45:00Z"
  }
}
```

**cURL:**
```bash
curl -X GET http://localhost:8000/api/documents/507f1f77bcf86cd799439013 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### Update Document Content
**PUT** `/documents/:docId`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request:**
```json
{
  "content": "console.log('Updated content!');"
}
```

**Response (200):**
```json
{
  "success": true,
  "document": {
    "_id": "507f1f77bcf86cd799439013",
    "name": "Hello World",
    "content": "console.log('Updated content!');",
    "version": 2,
    "updatedAt": "2024-01-15T11:00:00Z"
  }
}
```

**cURL:**
```bash
curl -X PUT http://localhost:8000/api/documents/507f1f77bcf86cd799439013 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "console.log('\''Updated content!'\'');"
  }'
```

---

### Rename Document
**PATCH** `/documents/:docId/rename`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request:**
```json
{
  "name": "New Document Name"
}
```

**Response (200):**
```json
{
  "success": true,
  "document": {
    "_id": "507f1f77bcf86cd799439013",
    "name": "New Document Name",
    "updatedAt": "2024-01-15T11:05:00Z"
  }
}
```

**cURL:**
```bash
curl -X PATCH http://localhost:8000/api/documents/507f1f77bcf86cd799439013/rename \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Document Name"
  }'
```

---

### Delete Document
**DELETE** `/documents/:docId`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200):**
```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

**cURL:**
```bash
curl -X DELETE http://localhost:8000/api/documents/507f1f77bcf86cd799439013 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 3. Room Endpoints

### Create Room
**POST** `/rooms`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request:**
```json
{
  "name": "Project Alpha",
  "description": "Collaborative development",
  "isPublic": false
}
```

**Response (201):**
```json
{
  "success": true,
  "room": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Project Alpha",
    "description": "Collaborative development",
    "owner": "507f1f77bcf86cd799439011",
    "members": ["507f1f77bcf86cd799439011"],
    "isPublic": false,
    "status": "active",
    "createdAt": "2024-01-15T10:40:00Z"
  }
}
```

**cURL:**
```bash
curl -X POST http://localhost:8000/api/rooms \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Project Alpha",
    "description": "Collaborative development",
    "isPublic": false
  }'
```

---

### List User's Rooms
**GET** `/rooms`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200):**
```json
{
  "success": true,
  "rooms": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Project Alpha",
      "description": "Collaborative development",
      "owner": "507f1f77bcf86cd799439011",
      "members": 2,
      "isPublic": false,
      "status": "active",
      "createdAt": "2024-01-15T10:40:00Z"
    }
  ]
}
```

**cURL:**
```bash
curl -X GET http://localhost:8000/api/rooms \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### Get Room Details
**GET** `/rooms/:roomId`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200):**
```json
{
  "success": true,
  "room": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Project Alpha",
    "description": "Collaborative development",
    "owner": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "members": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "name": "John Doe",
        "role": "owner"
      }
    ],
    "isPublic": false,
    "status": "active",
    "createdAt": "2024-01-15T10:40:00Z"
  }
}
```

---

### Get Room Members
**GET** `/rooms/:roomId/members`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200):**
```json
{
  "success": true,
  "members": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "user": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "role": "owner",
      "joinedAt": "2024-01-15T10:40:00Z",
      "isActive": true
    }
  ]
}
```

---

### Add Member to Room
**POST** `/rooms/:roomId/members`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request:**
```json
{
  "userId": "507f1f77bcf86cd799439015",
  "role": "editor"
}
```

**Response (201):**
```json
{
  "success": true,
  "member": {
    "_id": "507f1f77bcf86cd799439016",
    "user": "507f1f77bcf86cd799439015",
    "room": "507f1f77bcf86cd799439012",
    "role": "editor",
    "joinedAt": "2024-01-15T11:10:00Z"
  }
}
```

---

### Remove Member from Room
**DELETE** `/rooms/:roomId/members/:memberId`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200):**
```json
{
  "success": true,
  "message": "Member removed from room"
}
```

---

## 4. Activity Log Endpoints

### Get Activity Logs
**GET** `/documents/:docId/logs`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters:**
- `limit` (optional, default: 20) - Number of logs to retrieve

**Response (200):**
```json
{
  "success": true,
  "logs": [
    {
      "_id": "507f1f77bcf86cd799439017",
      "document": "507f1f77bcf86cd799439013",
      "user": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "John Doe"
      },
      "action": "created",
      "description": "Document created",
      "changes": {
        "name": "Hello World"
      },
      "createdAt": "2024-01-15T10:45:00Z"
    },
    {
      "_id": "507f1f77bcf86cd799439018",
      "document": "507f1f77bcf86cd799439013",
      "user": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "John Doe"
      },
      "action": "edited",
      "description": "Document content updated",
      "changes": {
        "version": 2
      },
      "createdAt": "2024-01-15T11:00:00Z"
    }
  ]
}
```

---

### Log Activity
**POST** `/documents/:docId/logs`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request:**
```json
{
  "action": "edited",
  "description": "User made changes to the document"
}
```

**Response (201):**
```json
{
  "success": true,
  "log": {
    "_id": "507f1f77bcf86cd799439019",
    "document": "507f1f77bcf86cd799439013",
    "user": "507f1f77bcf86cd799439011",
    "action": "edited",
    "description": "User made changes to the document",
    "createdAt": "2024-01-15T11:15:00Z"
  }
}
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Success |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing/invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 500 | Server Error - Internal error |

---

## Error Response Format

```json
{
  "success": false,
  "message": "Error description"
}
```

---

## Tips for Testing

### Using Postman
1. Create collection "Collaborative Editor"
2. Create environment with variable: `base_url = http://localhost:8000/api`
3. Use `{{base_url}}/endpoint` in requests
4. After login, set variable: `token` from response
5. Add header: `Authorization: Bearer {{token}}`

### Using VS Code REST Client
Create `test.http`:
```http
@baseUrl = http://localhost:8000/api
@token = YOUR_JWT_TOKEN_HERE

### Register
POST {{baseUrl}}/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "test123"
}

### Login
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "test123"
}
```

---

## Common Response Scenarios

### Success (200)
```json
{
  "success": true,
  "user": { ... }
}
```

### Created (201)
```json
{
  "success": true,
  "document": { ... }
}
```

### Bad Request (400)
```json
{
  "success": false,
  "message": "Please provide all required fields"
}
```

### Unauthorized (401)
```json
{
  "success": false,
  "message": "Token expired or invalid"
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Rate Limits

Currently no rate limiting. Consider implementing in production:
- 100 requests per hour per IP for unauthenticated
- 1000 requests per hour per user for authenticated

---

For more information, see [README.md](./README.md) and [QUICK_START.md](./QUICK_START.md)
