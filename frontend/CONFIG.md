# Frontend Configuration Guide

## Environment Variables Setup

The frontend uses environment variables to configure the API and WebSocket URLs. This allows easy switching between development, staging, and production environments.

### .env File

Create a `.env` file in the root of the frontend directory:

```
# Backend API Configuration
VITE_API_BASE_URL=http://localhost:8000/api
VITE_WS_URL=ws://localhost:8000/ws

# Environment
VITE_ENV=development
```

### Environment Variables Available

| Variable | Purpose | Default | Example |
|----------|---------|---------|---------|
| `VITE_API_BASE_URL` | REST API base URL | `http://localhost:8000/api` | `https://api.example.com/api` |
| `VITE_WS_URL` | WebSocket URL | `ws://localhost:8000/ws` | `wss://api.example.com/ws` |
| `VITE_ENV` | Environment name | `development` | `production` |

### For Production

Update your `.env` with production URLs:

```
VITE_API_BASE_URL=https://api.yourdomain.com/api
VITE_WS_URL=wss://api.yourdomain.com/ws
VITE_ENV=production
```

---

## Axios Configuration

### Automatic JWT Token Handling

The frontend uses Axios with automatic JWT token injection. Every API request automatically includes the JWT token in the Authorization header:

```
Authorization: Bearer {token}
```

### Key Features

✅ **Automatic Token Injection** - JWT token from cookies is added to every request  
✅ **Request Interceptor** - Validates and adds token automatically  
✅ **Response Interceptor** - Handles 401 errors and redirects to login  
✅ **Error Handling** - Logs errors and provides fallback responses  
✅ **Environment Configuration** - Uses .env for API URLs  

### How It Works

1. **Login API Call** → Token stored in secure cookie (`jwt_token`)
2. **Any API Request** → Axios interceptor retrieves token from cookie
3. **Token Added** → `Authorization: Bearer {token}` header added
4. **Request Sent** → API receives request with authentication
5. **401 Response** → User redirected to login page automatically

---

## Service Files

### [axiosInstance.js](src/services/axiosInstance.js)
Creates configured Axios instance with:
- Base URL from environment variables
- Request interceptor for JWT injection
- Response interceptor for error handling
- 10-second timeout

```javascript
// Usage in any service
import axiosInstance from './axiosInstance';

const response = await axiosInstance.get('/documents');
// Token is automatically added!
```

### [apiService.js](src/services/apiService.js)
All API endpoints using Axios:
- `POST /documents` - Create document
- `GET /documents` - List documents
- `PUT /documents/{docId}` - Update document
- `DELETE /documents/{docId}` - Delete document
- `PATCH /documents/{docId}/rename` - Rename document
- `POST /auth/login` - User login
- `GET /users/current` - Get current user
- And more...

### [websocketService.js](src/services/websocketService.js)
WebSocket connection with:
- Token-based authentication
- Automatic reconnection logic (max 5 attempts)
- Event emitter pattern
- Fallback to event emitter if WebSocket fails

---

## API Request Examples

### Making API Calls

All API calls should go through `apiService`:

```javascript
import apiService from './services/apiService';

// List documents - token auto-included
const docs = await apiService.listDocuments();

// Create document - token auto-included
const newDoc = await apiService.createDocument('My File');

// Update document - token auto-included
await apiService.updateDocument(docId, 'new content');
```

### Error Handling

Axios automatically handles errors:

```javascript
try {
  const response = await axiosInstance.get('/documents');
  console.log('Success:', response);
} catch (error) {
  // On 401: User redirected to login automatically
  // On other errors: error.message contains details
  console.error('Error:', error.message);
}
```

---

## Backend Requirements

Your backend must:

### 1. Accept JWT Token

```
Header: Authorization: Bearer {jwt_token}
```

### 2. Implement CORS

```javascript
// Example: Node.js/Express
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,  // Important for cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
}));
```

### 3. Set Cookie Properly

```
Set-Cookie: jwt_token=...; HttpOnly; Secure; SameSite=Strict; Max-Age=604800
```

### 4. API Response Format

```javascript
// Success
{
  success: true,
  data: { ... }
}

// Error
{
  success: false,
  message: "Error description"
}
```

---

## Testing the Integration

1. **Start Backend**
   ```bash
   # Your backend server on http://localhost:8000
   ```

2. **Update .env** (if needed)
   ```
   VITE_API_BASE_URL=http://localhost:8000/api
   ```

3. **Start Frontend**
   ```bash
   cd frontend
   npm run dev
   ```

4. **Check Network Tab**
   - Open browser DevTools → Network tab
   - Look for API requests with `Authorization: Bearer ...` header
   - Verify token is being sent with every request

5. **Check Console**
   - Axios logs all requests/errors
   - WebSocket logs connection status
   - Monitor for authentication issues

---

## Troubleshooting

### "401 Unauthorized" Errors

**Problem:** Token not being sent  
**Solution:** Check:
- Browser cookies → Is `jwt_token` present?
- Network tab → Authorization header present?
- Token expired? (7 days)

### "Cannot POST /api/documents"

**Problem:** Backend not responding  
**Solution:** Check:
- Backend is running
- `VITE_API_BASE_URL` in .env is correct
- CORS is enabled on backend
- Firewall isn't blocking port 8000

### WebSocket Connection Failed

**Problem:** Real-time features not working  
**Solution:** Check:
- Is `VITE_WS_URL` correct?
- Backend WebSocket endpoint exists?
- Use `ws://` for development, `wss://` for production
- Token is being passed in query string

---

## Security Notes

✅ **Token Storage:** Stored in secure, HttpOnly cookies (not localStorage)  
✅ **Token Transmission:** Sent in Authorization header, not query string  
✅ **CORS:** Only allows requests from specific origins  
✅ **Timeout:** 10-second timeout prevents hanging requests  
✅ **Redirect:** 401 errors redirect to login automatically  

---

## .gitignore

Make sure `.env` is in your `.gitignore`:

```
# Environment variables
.env
.env.local
.env.*.local
```

Use `.env.example` for reference:

```bash
cp .env.example .env
# Then edit .env with your local values
```

---

For more details, see:
- [Axios Documentation](https://axios-http.com/docs/intro)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
