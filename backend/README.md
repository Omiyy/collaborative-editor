# Collaborative Code Editor - Backend

Express.js backend server for the Collaborative Code Editor with MongoDB database and JWT authentication.

## Features

✅ **User Authentication** - JWT-based authentication with secure password hashing  
✅ **Room Management** - Create and manage collaborative rooms  
✅ **Document CRUD** - Full document lifecycle management  
✅ **Real-time Collaboration** - Ready for WebSocket integration  
✅ **Activity Logging** - Track all user activities  
✅ **Role-Based Access** - Owner, Editor, Viewer roles  
✅ **MongoDB Integration** - Scalable NoSQL database  

## Prerequisites

- **Node.js** (v14 or higher)
- **MongoDB** (local or Atlas cloud)
- **npm** or **yarn**

## Installation

### 1. Clone Repository
```bash
cd backend
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```
PORT=8000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/collaborative-editor
JWT_SECRET_KEY=your_super_secret_key_here
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173,http://localhost:5174,http://localhost:5175
```

### 3. Database Setup

**Option A: Local MongoDB**
```bash
# Install MongoDB locally
# Start MongoDB service:
mongod

# Verify connection:
mongo mongodb://localhost:27017/collaborative-editor
```

**Option B: MongoDB Atlas (Cloud)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account and cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/collaborative-editor
```

### 4. Start Server

**Development** (with auto-reload):
```bash
npm run dev
```

**Production**:
```bash
npm start
```

Server will start on `http://localhost:8000`

## API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | Login user | ❌ |
| GET | `/api/auth/current` | Get current user | ✅ |
| POST | `/api/auth/logout` | Logout user | ✅ |

### Documents
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/documents` | Create document | ✅ |
| GET | `/api/documents` | List documents | ✅ |
| GET | `/api/documents/:docId` | Get single document | ✅ |
| PUT | `/api/documents/:docId` | Update document content | ✅ |
| PATCH | `/api/documents/:docId/rename` | Rename document | ✅ |
| DELETE | `/api/documents/:docId` | Delete document | ✅ |

### Rooms
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/rooms` | Create room | ✅ |
| GET | `/api/rooms` | Get user's rooms | ✅ |
| GET | `/api/rooms/:roomId` | Get room details | ✅ |
| GET | `/api/rooms/:roomId/members` | Get room members | ✅ |
| POST | `/api/rooms/:roomId/members` | Add member to room | ✅ |
| DELETE | `/api/rooms/:roomId/members/:memberId` | Remove member | ✅ |

### Activity Logs
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/documents/:docId/logs` | Get activity logs | ✅ |
| POST | `/api/documents/:docId/logs` | Log activity | ✅ |

## Request/Response Examples

### Register User
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Login User
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Create Room
```bash
curl -X POST http://localhost:8000/api/rooms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Project Alpha",
    "description": "Collaborative development room"
  }'
```

### Create Document
```bash
curl -X POST http://localhost:8000/api/documents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Main App",
    "roomId": "507f1f77bcf86cd799439011"
  }'
```

## Database Schema

### User
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  avatar: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Room
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  owner: ObjectId (User),
  members: [ObjectId] (RoomMembers),
  isPublic: Boolean,
  status: String (active|archived|deleted),
  createdAt: Date,
  updatedAt: Date
}
```

### RoomMember
```javascript
{
  _id: ObjectId,
  user: ObjectId (User),
  room: ObjectId (Room),
  role: String (owner|editor|viewer),
  joinedAt: Date,
  isActive: Boolean,
  lastSeenAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### CodeDocument
```javascript
{
  _id: ObjectId,
  name: String,
  content: String,
  room: ObjectId (Room),
  createdBy: ObjectId (User),
  language: String,
  isPublic: Boolean,
  version: Number,
  status: String (active|archived|deleted),
  createdAt: Date,
  updatedAt: Date
}
```

### ActivityLog
```javascript
{
  _id: ObjectId,
  document: ObjectId (CodeDocument),
  user: ObjectId (User),
  action: String (created|edited|deleted|renamed|shared),
  description: String,
  changes: Object,
  createdAt: Date,
  updatedAt: Date
}
```

## Folder Structure

```
backend/
├── src/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js     # Auth logic
│   │   ├── documentController.js # Document CRUD
│   │   ├── roomController.js     # Room management
│   │   └── activityController.js # Activity logs
│   ├── middleware/
│   │   └── auth.js               # JWT authentication
│   ├── models/
│   │   ├── User.js               # User schema
│   │   ├── Room.js               # Room schema
│   │   ├── RoomMember.js         # RoomMember schema
│   │   ├── CodeDocument.js       # Document schema
│   │   └── ActivityLog.js        # Activity log schema
│   ├── routes/
│   │   ├── authRoutes.js         # Auth endpoints
│   │   ├── documentRoutes.js     # Document endpoints
│   │   ├── roomRoutes.js         # Room endpoints
│   │   └── activityRoutes.js     # Activity endpoints
│   ├── utils/
│   │   └── jwt.js                # JWT utilities
│   └── server.js                 # Main server file
├── .env                          # Environment variables
├── .env.example                  # Environment template
├── .gitignore                    # Git ignore patterns
└── package.json                  # Dependencies
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 8000 |
| `NODE_ENV` | Environment (development/production) | development |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/collaborative-editor |
| `JWT_SECRET_KEY` | Secret key for JWT signing (preferred) | - (REQUIRED) |
| `JWT_EXPIRE` | JWT expiration time | 7d |
| `CORS_ORIGIN` | Allowed origins (comma-separated) | http://localhost:5173 |

## Security Best Practices

✅ **Change JWT_SECRET_KEY** - Update to a strong random string in production  
✅ **Enable HTTPS** - Use SSL/TLS in production  
✅ **CORS Configuration** - Restrict to your frontend domain  
✅ **MongoDB Auth** - Enable username/password for MongoDB  
✅ **Input Validation** - All inputs are validated  
✅ **Password Hashing** - bcryptjs with 10 salt rounds  
✅ **Token Storage** - JWT stored in secure HttpOnly cookies  

## Connection with Frontend

Frontend expects API at `http://localhost:8000/api`

To connect frontend to this backend:

1. **Update Frontend .env:**
```
VITE_API_BASE_URL=http://localhost:8000/api
VITE_WS_URL=ws://localhost:8000
```

2. **Start Frontend:**
```bash
cd ../frontend
npm run dev
```

3. **Test Connection:**
   - Open http://localhost:5173
   - Register/Login
   - Check Network tab for requests to http://localhost:8000/api

## Troubleshooting

### MongoDB Connection Failed
```
✗ MongoDB connection error: connect ECONNREFUSED
```
**Solution:** 
- Make sure MongoDB is running: `mongod`
- Check MONGODB_URI in .env
- Try MongoDB Atlas connection string

### JWT Secret Not Set
```
Error: JWT secret is missing. Set JWT_SECRET_KEY (preferred) or JWT_SECRET.
```
**Solution:**
- Update `.env` with `JWT_SECRET_KEY=your_secret_key`

### Port Already in Use
```
Error: listen EADDRINUSE :::8000
```
**Solution:**
- Change PORT in .env
- Or kill process on port: `lsof -ti:8000 | xargs kill -9`

### CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution:**
- Update `CORS_ORIGIN` in .env to match frontend URL
- Restart server after changing .env

## Next Steps

1. ✅ Install MongoDB locally or use Atlas
2. ✅ Update `.env` with your configuration
3. ✅ Run `npm run dev` to start server
4. ✅ Test endpoints with Postman or cURL
5. ✅ Connect frontend and test full integration

## License

ISC

## Support

For issues or questions, please open an issue in the repository.
