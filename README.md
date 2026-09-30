# ReadTogether

> **Read the same story, together.**

A real-time collaborative PDF reading web application where users can create reading rooms, invite friends, and read PDFs together with synchronized page turning.

## Features

- **Real-time Synchronization**: Page changes sync instantly between readers with smooth animations
- **Private Reading Rooms**: Create secure rooms with shareable links — no account required
- **Cross-device Support**: Works beautifully on phones, tablets, and desktops
- **Multiple Reading Modes**: Light, Dark, and Sepia themes
- **Shared/Host Control Modes**: Both readers can navigate, or only the host controls pages
- **Real-time Chat**: Communicate while reading
- **Bookmarks**: Personal and shared bookmarks
- **Reactions**: Lightweight emoji reactions
- **Presence Indicators**: See who's online and what page they're on
- **Connection Recovery**: Automatic reconnection with state restoration
- **Responsive Design**: Optimized for all screen sizes (320px - 1920px+)
- **Accessibility**: Semantic HTML, keyboard navigation, screen reader support

## Tech Stack

### Frontend
- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Zustand** for state management
- **React Router** for routing
- **PDF.js / react-pdf** for PDF rendering
- **Socket.IO Client** for real-time communication
- **Lucide React** for icons

### Backend
- **Node.js** + **Express** + **TypeScript**
- **Socket.IO** for WebSocket communication
- **MongoDB** + **Mongoose** for data persistence
- **Multer** for file uploads
- **JWT** for authentication
- **Zod** for validation

### Storage (Modular)
- Local filesystem (default)
- AWS S3
- Supabase Storage

## Project Structure

```
readtogether/
├── client/                 # Frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── ui/         # Base UI components
│   │   │   ├── layout/     # Layout components (Header, Toolbar, Sidebar)
│   │   │   ├── reader/     # PDF reader components
│   │   │   ├── chat/       # Chat components
│   │   │   ├── participants/ # Participant components
│   │   │   ├── bookmarks/  # Bookmark components
│   │   │   ├── settings/   # Settings components
│   │   │   └── providers/  # Context providers
│   │   ├── pages/          # Page components
│   │   ├── layouts/        # Layout wrappers
│   │   ├── hooks/          # Custom React hooks
│   │   ├── store/          # Zustand stores
│   │   ├── services/       # API & Socket services
│   │   ├── types/          # TypeScript types
│   │   ├── utils/          # Utility functions
│   │   └── animations/     # Framer Motion variants
│   └── public/
└── server/                 # Backend application
    ├── src/
        ├── config/         # Configuration
        ├── controllers/    # Route controllers
        ├── middleware/     # Express middleware
        ├── models/         # Mongoose models
        ├── routes/         # API routes
        ├── services/       # Business logic
        ├── sockets/        # Socket.IO handlers
        └── utils/          # Utility functions
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB 6+
- npm or yarn

### Installation

1. **Clone and install dependencies:**
```bash
# Install all dependencies
npm run install:all
```

2. **Configure environment variables:**
```bash
# Copy example env files
cp .env.example .env
# Edit .env with your configuration
```

3. **Start MongoDB:**
```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or start your local MongoDB instance
```

4. **Run development servers:**
```bash
# Run both client and server
npm run dev

# Or run separately:
npm run dev:client  # Frontend on http://localhost:3000
npm run dev:server  # Backend on http://localhost:4000
```

### Production Build

```bash
# Build both client and server
npm run build

# Start production server
npm run start
```

## Environment Variables

See `.env.example` for all available options.

### Required
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT tokens (min 32 chars)
- `SERVER_PORT` - Backend port (default: 4000)
- `CLIENT_URL` - Frontend URL for CORS

### Storage Options
- `STORAGE_TYPE` - `local` | `s3` | `supabase` (default: local)
- For S3: `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`
- For Supabase: `SUPABASE_URL`, `SUPABASE_KEY`, `SUPABASE_BUCKET`

## API Endpoints

### Books
- `POST /api/books/upload` - Upload PDF (multipart/form-data)
- `GET /api/books/:bookId` - Get book info
- `DELETE /api/books/:bookId` - Delete book (owner only)
- `GET /api/books/my` - Get user's books

### Rooms
- `POST /api/rooms` - Create room
- `GET /api/rooms/my` - Get user's rooms
- `GET /api/rooms/:roomId` - Get room by ID
- `GET /api/rooms/code/:roomCode` - Get room by code
- `PATCH /api/rooms/:roomId/settings` - Update room settings (host only)
- `POST /api/rooms/:roomId/leave` - Leave room

### Chat & Interactions
- `GET /api/chat/:roomId/messages` - Get messages
- `GET /api/chat/:roomId/bookmarks` - Get bookmarks
- `POST /api/chat/:roomId/bookmarks` - Add bookmark
- `DELETE /api/chat/:roomId/bookmarks/:bookmarkId` - Remove bookmark
- `POST /api/chat/:roomId/reactions` - Add reaction

## Socket.IO Events

### Client → Server
| Event | Data | Description |
|-------|------|-------------|
| `join_room` | `{ roomId }` | Join a reading room |
| `leave_room` | `{ roomId }` | Leave current room |
| `page_changed` | `{ roomId, pageNumber }` | Navigate to page |
| `chat_message` | `{ roomId, message }` | Send chat message |
| `reaction` | `{ roomId, type }` | Send reaction |
| `typing_start` | `{ roomId }` | Start typing indicator |
| `typing_stop` | `{ roomId }` | Stop typing indicator |
| `request_sync` | `{ roomId }` | Request full state sync |
| `update_settings` | `{ roomId, settings }` | Update room settings (host) |

### Server → Client
| Event | Data | Description |
|-------|------|-------------|
| `room_state` | `{ room, book, currentUser, messages, bookmarks }` | Initial room state |
| `user_joined` | `{ participant }` | User joined room |
| `user_left` | `{ userId, displayName }` | User left room |
| `page_changed` | `{ pageNumber, userId, displayName, color, animated }` | Page changed |
| `chat_message` | `ChatMessage` | New chat message |
| `reaction` | `{ userId, displayName, avatar, color, type }` | New reaction |
| `user_typing` | `{ userId, displayName, isTyping }` | Typing indicator |
| `settings_changed` | `{ settings, changedBy }` | Settings updated |
| `sync_response` | `{ currentPage, controlMode, hostId }` | Sync response |
| `error` | `{ code, message }` | Error occurred |
| `reconnected` | `{ roomId, currentPage }` | Reconnected after disconnect |

## Architecture

### Real-time Synchronization
1. User changes page → Client sends `page_changed` event
2. Server validates room membership and control mode
3. Server updates room's `lastPage` and participant's `currentPage`
4. Server broadcasts `page_changed` to all room members
5. Clients receive event and animate to new page

### Connection Recovery
1. Socket.IO handles automatic reconnection
2. On reconnect, client emits `request_sync`
3. Server responds with `sync_response` (current page, control mode)
4. Client navigates to correct page automatically

### Room State Persistence
- Room metadata, book info, participants stored in MongoDB
- Chat messages, bookmarks, reactions persisted
- On server restart, users can rejoin and restore state

## Keyboard Shortcuts (Desktop)

| Key | Action |
|-----|--------|
| `←` / `ArrowLeft` | Previous page |
| `→` / `ArrowRight` | Next page |
| `Space` | Next page |
| `F` | Toggle fullscreen |
| `Escape` | Exit fullscreen |

## Mobile Gestures

| Gesture | Action |
|---------|--------|
| Swipe left | Next page |
| Swipe right | Previous page |
| Pinch | Zoom |
| Double tap | Zoom / Reset zoom |
| Tap | Show/hide controls |

## Deployment

### Quick Deploy to Vercel + Railway

**See [VERCEL_SETUP.md](./VERCEL_SETUP.md) for detailed 5-step guide**

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy frontend to Vercel
cd client && vercel --prod

# 3. Deploy backend to Railway
# Visit https://railway.app and deploy from GitHub
```

**Environment Variables Required:**
- Server: `MONGODB_URI`, `JWT_SECRET`, `ALLOWED_ORIGINS`
- Client: `VITE_API_URL`, `VITE_SOCKET_URL`

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for all deployment options.

### Docker (Alternative)
```dockerfile
# Build and run with docker-compose
docker-compose up -d
```

### Manual Deployment
1. Build: `npm run build`
2. Set production environment variables
3. Run: `npm run start`
4. Use PM2 or systemd for process management
5. Configure reverse proxy (nginx) for HTTPS

### Environment-specific configs
- Set `NODE_ENV=production`
- Use strong `JWT_SECRET`
- Configure proper `CLIENT_URL`
- Use managed MongoDB (Atlas) and S3 for production

## Testing

```bash
# Run tests (when implemented)
npm run test

# Manual testing checklist:
# - Phone → Phone
# - Phone → Laptop
# - Laptop → Laptop
# - Tablet → Laptop
# - Connection drop & recovery
# - Large PDF handling
```

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit PR

## License

MIT License - see LICENSE file for details

## Acknowledgments

- PDF.js for PDF rendering
- Socket.IO for real-time communication
- Framer Motion for animations
- Tailwind CSS for styling
- All open-source contributors