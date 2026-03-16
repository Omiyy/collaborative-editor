# Frontend - Collaborative Code Editor

Complete React frontend for the Collaborative Code Editor with real-time collaboration features.

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/           # Reusable React components
│   │   ├── CodeEditor.jsx    # Monaco Editor wrapper
│   │   ├── EditorToolbar.jsx # Save, Logs, Invite buttons
│   │   ├── LogsPanel.jsx     # Activity logs display
│   │   ├── UserList.jsx      # Connected users list
│   │   ├── InviteModal.jsx   # User invitation dialog
│   │   ├── DocumentList.jsx  # Document sidebar
│   │   └── Navbar.jsx        # Top navigation
│   ├── pages/
│   │   └── EditorPage.jsx    # Main editor layout
│   ├── services/
│   │   ├── apiService.js     # API client (placeholder)
│   │   └── websocketService.js # WebSocket client (placeholder)
│   ├── assets/               # Static assets (SVG, images)
│   ├── App.jsx               # Main app component
│   ├── App.css               # App styles
│   ├── main.jsx              # React entry point
│   └── index.css             # Global styles with Tailwind
├── index.html                # HTML entry point
├── package.json              # Dependencies and scripts
├── vite.config.js            # Vite configuration
├── tailwind.config.js        # Tailwind CSS config
├── postcss.config.js         # PostCSS configuration
├── eslint.config.js          # ESLint configuration
└── .gitignore                # Git ignore rules
```

## 🚀 Quick Start

### Installation

```bash
cd frontend
npm install --legacy-peer-deps
```

### Development

```bash
npm run dev
```

Opens at: `http://localhost:5173/`

### Build for Production

```bash
npm run build
```

### Lint Code

```bash
npm run lint
```

### Preview Production Build

```bash
npm run preview
```

## 🛠 Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 19.2** | UI framework |
| **Vite 5.0** | Build tool & dev server |
| **React Router 6** | Client-side routing |
| **Monaco Editor** | Code editor |
| **TailwindCSS 3.4** | Styling |
| **Lucide React** | Icons |
| **Radix UI** | Headless components |
| **PostCSS** | CSS processing |

## 📦 Dependencies

### Runtime (`npm install`)
- `react` - UI library
- `react-dom` - DOM rendering
- `react-router-dom` - Routing (v6+)
- `@monaco-editor/react` - Code editor
- `tailwindcss` - CSS framework
- `postcss` & `autoprefixer` - CSS processing
- `@radix-ui/*` - Component primitives
- `lucide-react` - Icon library

### Development (`npm install --legacy-peer-deps`)
- Vite & @vitejs/plugin-react - Build tools
- ESLint & plugins - Code quality
- Various types packages

## 🎨 UI Features

### Three-Panel Layout
- **Left Sidebar**: Document list & user management
- **Center**: Full-featured Monaco code editor
- **Right Panel**: Activity logs (collapsible)

### Components

**CodeEditor**: 
- Full-height Monaco editor
- Syntax highlighting
- Auto-formatting
- Dark theme default

**EditorToolbar**: 
- Save button
- Logs toggle
- Invite button

**LogsPanel**: 
- Activity history
- User attribution
- Timestamps
- Collapsible

**UserList**: 
- Active users
- Role badges (Editor/Viewer)
- User status

**InviteModal**: 
- Email input
- Role selector
- Link sharing
- Copy to clipboard

**DocumentList**: 
- Create new document
- Document navigation
- Timestamps

**Navbar**: 
- App branding
- Theme selector
- User menu
- Logout button

## 🎨 Theming System

### Available Themes
1. **Dark** (Default)
2. **Light**
3. **Orange**

### CSS Variables
```css
--background
--foreground
--accent
--card
--border
--muted
--muted-foreground
```

Themes persist in `localStorage` as `editorTheme`.

## 🔌 WebSocket Integration

**File**: `src/services/websocketService.js`

**Placeholder URL**: `ws://localhost:8000/ws/{roomId}`

**Methods**:
```javascript
connect(roomId)           // Establish connection
disconnect()              // Close connection
sendCodeUpdate(content)   // Send code changes
onMessage(callback)       // Register message handler
```

## 📡 API Integration

**File**: `src/services/apiService.js`

**Placeholder URL**: `http://localhost:8000/api`

**Main Endpoints**:
- Documents: create, read, update, delete, list
- Users: getCurrentUser, getUsersInRoom
- Invites: sendInvite, getInvites
- Logs: getActivityLogs, logActivity

## 🔄 State Management

Using React hooks (No Redux):
- `useState` - Component state
- `useEffect` - Side effects
- `useRef` - Editor ref

## ⚙️ Configuration

### Vite Config (`vite.config.js`)
- Port: 5173
- Auto-open browser on dev start
- React plugin enabled

### Tailwind Config (`tailwind.config.js`)
- Scans `src/` for class names
- Custom CSS variables theme

### ESLint Config (`eslint.config.js`)
- React & JSX support
- React Hooks rules
- React Refresh support

## 🐛 Troubleshooting

### Port Already in Use
```bash
npm run dev -- --port 3000
```

### Node Version Issues
Requires Node.js 20.19+ or 22.12+
```bash
node --version
```

### Dependency Conflicts
```bash
npm install --legacy-peer-deps
npm cache clean --force
```

### Component Import Errors
Check that all imports use `.jsx` extension for component files.

## 🔗 Backend Integration

1. Update `src/services/apiService.js` with real API endpoints
2. Update `src/services/websocketService.js` with real WebSocket URL
3. Implement authentication token management
4. Add error handling and retry logic
5. Update CORS headers if needed

## 📝 Development Tips

- **HMR**: Hot module reloading works automatically with Vite
- **Debugging**: Use Chrome DevTools
- **Browser Console**: Check for API/WebSocket logs
- **Components**: Keep components focused and reusable
- **Styling**: Use Tailwind utility classes in className

## 🚀 Deployment

### Build Production
```bash
npm run build
```

### Deploy to
- **Vercel**: Connect GitHub repo
- **Netlify**: Drag & drop `dist/` folder
- **GitHub Pages**: Use `dist/` as source
- **Docker**: Create Dockerfile with Node base
- **Any Static Host**: Upload `dist/` contents

### Environment Variables
```bash
VITE_API_URL=https://api.example.com
VITE_WS_URL=wss://socket.example.com
```

Use in code:
```javascript
const apiUrl = import.meta.env.VITE_API_URL
```

## 📄 Scripts

```bash
npm run dev       # Start dev server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Check code quality
```

## 🎯 Next Steps

1. ✅ Restore all files
2. ✅ Test dev server with `npm run dev`
3. ⏭️ Connect to backend API
4. ⏭️ Implement WebSocket connection
5. ⏭️ Add authentication
6. ⏭️ Deploy to production

## 📞 Support

For issues:
1. Check `package.json` dependencies
2. Verify Node.js version
3. Review `vite.config.js` settings
4. Check browser console for errors
5. Ensure backend is running for real-time features

---

**Status**: ✅ Ready for development and backend integration
