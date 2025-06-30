# Kindred - Task Management System

## Cool Stuff

### Real-Time Updates with WebSockets
- Create a task and watch it appear instantly across all browser tabs
- Update task status and see live changes without page refresh
- Live statistics counters update in real-time
- Automatic reconnection with exponential backoff

### Task Management
- **Complete CRUD Operations**: Create, read, update, and delete tasks
- **Priority System**: Low/Medium/High/Critical priority with color-coded badges
- **Status Tracking**: To Do, In Progress, Completed with quick status changes
- **Due Date Management**: Due dates with overdue indicators and warnings
- **User Assignment**: Assign tasks to users with permission-based editing

### Filtering System
- **Status Filtering**: Filter by task status (To Do, In Progress, Completed)
- **Priority Filtering**: Filter by priority levels (Low, Medium, High, Critical)
- **Assignment Filtering**: "Assigned to Me", "Created by Me", "Unassigned", "All Tasks"
- **Persistent Filters**: Filter preferences saved across sessions

### Authentication & Security
- **JWT Authentication**: Secure login/signup with access and refresh tokens
- **Protected Routes**: Route protection with loading states
- **WebSocket Security**: Authenticated WebSocket connections
- **Session Management**: Automatic token refresh and session persistence

*(you can sign into demo with any email, username or password, there is no verification or constraints)*

### User Experience
- **Responsive Design**: Mobile-first design that works on all screen sizes
- **Modern UI**: Clean interface with glassmorphism effects and smooth animations
- **Toast Notifications**: Real-time feedback for user actions
- **Loading States**: Comprehensive loading indicators throughout the app

### Technical Stack
- **Modern React 19**: Latest React features with TypeScript
- **Type-Safe API**: End-to-end type safety with Elysia Eden
- **State Management**: Jotai for atomic state management
- **Real-Time**: WebSocket integration for live updates
- **Responsive**: Tailwind CSS 4 for modern styling

### Live Demo
- **Frontend**: https://track.cansu.dev
- **Backend**: https://apitrack.cansu.dev/swagger
### Deploy
```bash
git clone <repository-url>
git submodule init
git submodule sync
cd kindred
docker-compose up --build
```
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001