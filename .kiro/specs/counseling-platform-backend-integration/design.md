# Design Document

## Overview

This design document outlines the architecture and implementation approach for transforming the counseling platform from mock data to a fully functional system with real backend integration. The system will support four user roles (Student, Counselor, Chairperson, Admin) with comprehensive CRUD operations, real-time messaging via Socket.io, and resource sharing capabilities.

## Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │    │  Express Server │    │   PostgreSQL    │
│                 │    │                 │    │    Database     │
│ - React Query   │◄──►│ - REST APIs     │◄──►│                 │
│ - Socket.io     │    │ - Socket.io     │    │ - Prisma ORM    │
│ - Axios         │    │ - JWT Auth      │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

**Frontend:**
- React 18 with Vite
- React Router for navigation
- React Query for data fetching and caching
- Socket.io-client for real-time communication
- Axios for HTTP requests
- Radix UI + Tailwind CSS for styling
- React Hook Form + Zod for form validation

**Backend:**
- Node.js with Express
- Socket.io for real-time features
- Prisma ORM with PostgreSQL
- JWT for authentication
- Multer for file uploads
- bcrypt for password hashing

## Components and Interfaces

### Database Schema Enhancement

The current Prisma schema needs significant expansion to support all features:

```prisma
model User {
  id         String  @id @default(cuid())
  name       String
  email      String  @unique
  password   String
  role       Role
  department String
  studentId  String?
  employeeId String?
  isActive   Boolean @default(true)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relationships
  StudentAppointments   Appointment[]  @relation("StudentAppointments")
  CounselorAppointments Appointment[]  @relation("CounselorAppointments")
  Availability          Availability[]
  SentMessages         Message[]      @relation("SentMessages")
  ReceivedMessages     Message[]      @relation("ReceivedMessages")
  ConversationParticipants ConversationParticipant[]
  StudentNotes         StudentNote[]  @relation("StudentNotes")
  CounselorNotes       StudentNote[]  @relation("CounselorNotes")
  Notifications        Notification[]
  UploadedFiles        SharedFile[]
}

enum Role {
  STUDENT
  COUNSELOR
  CHAIRPERSON
  ADMIN
}

model Conversation {
  id           String @id @default(uuid())
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  participants ConversationParticipant[]
  messages     Message[]
  sharedFiles  SharedFile[]
}

model ConversationParticipant {
  id             String @id @default(uuid())
  conversationId String
  userId         String
  joinedAt       DateTime @default(now())
  
  conversation   Conversation @relation(fields: [conversationId], references: [id])
  user          User @relation(fields: [userId], references: [id])
  
  @@unique([conversationId, userId])
}

model Message {
  id             String @id @default(uuid())
  content        String
  senderId       String
  conversationId String
  isRead         Boolean @default(false)
  createdAt      DateTime @default(now())
  
  sender         User @relation("SentMessages", fields: [senderId], references: [id])
  conversation   Conversation @relation(fields: [conversationId], references: [id])
}

model SharedFile {
  id             String @id @default(uuid())
  filename       String
  originalName   String
  mimeType       String
  size           Int
  path           String
  conversationId String
  uploadedById   String
  createdAt      DateTime @default(now())
  
  conversation   Conversation @relation(fields: [conversationId], references: [id])
  uploadedBy     User @relation(fields: [uploadedById], references: [id])
}

model StudentNote {
  id          String @id @default(uuid())
  studentId   String
  counselorId String
  title       String
  content     String
  sessionDate DateTime
  isPrivate   Boolean @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  student     User @relation("StudentNotes", fields: [studentId], references: [id])
  counselor   User @relation("CounselorNotes", fields: [counselorId], references: [id])
}

model Notification {
  id        String @id @default(uuid())
  userId    String
  title     String
  message   String
  type      NotificationType
  isRead    Boolean @default(false)
  data      Json?
  createdAt DateTime @default(now())
  
  user      User @relation(fields: [userId], references: [id])
}

enum NotificationType {
  APPOINTMENT_BOOKED
  APPOINTMENT_CANCELLED
  APPOINTMENT_RESCHEDULED
  MESSAGE_RECEIVED
  FILE_SHARED
  SYSTEM_NOTIFICATION
}
```

### API Routes Structure

**Authentication Routes (`/api/auth`)**
- POST `/login` - User login
- POST `/logout` - User logout  
- GET `/me` - Get current user
- POST `/change-password` - Change password

**User Management Routes (`/api/users`)**
- GET `/` - Get all users (Admin/Chairperson)
- POST `/` - Create user (Admin only for chairpersons)
- GET `/:id` - Get user by ID
- PUT `/:id` - Update user (Admin/Chairperson)
- DELETE `/:id` - Delete user (Admin only)
- GET `/students` - Get students (Counselor/Chairperson/Admin)
- GET `/counselors` - Get counselors (All roles)

**Appointment Routes (`/api/appointments`)**
- GET `/` - Get appointments with filters
- POST `/` - Create appointment
- GET `/:id` - Get appointment by ID
- PUT `/:id` - Update appointment
- DELETE `/:id` - Cancel appointment
- GET `/availability/:counselorId` - Get counselor availability

**Message Routes (`/api/messages`)**
- GET `/conversations` - Get user conversations
- POST `/conversations` - Create/start conversation
- GET `/conversations/:id/messages` - Get conversation messages
- POST `/conversations/:id/messages` - Send message
- PUT `/messages/:id/read` - Mark message as read

**File Routes (`/api/files`)**
- POST `/conversations/:id/upload` - Upload file to conversation
- GET `/conversations/:id/files` - Get conversation files
- DELETE `/files/:id` - Delete shared file
- GET `/files/:id/download` - Download file

**Student Notes Routes (`/api/notes`)**
- GET `/students/:studentId` - Get student notes
- POST `/students/:studentId` - Create student note
- PUT `/:id` - Update note
- DELETE `/:id` - Delete note

**Notification Routes (`/api/notifications`)**
- GET `/` - Get user notifications
- PUT `/:id/read` - Mark notification as read
- PUT `/mark-all-read` - Mark all notifications as read

**Analytics Routes (`/api/analytics`)**
- GET `/dashboard` - Get dashboard statistics
- GET `/appointments` - Get appointment analytics
- GET `/students` - Get student engagement metrics

### Frontend API Integration

**API Service Layer Structure:**
```javascript
// src/api/
├── auth.js          // Authentication APIs
├── users.js         // User management APIs  
├── appointments.js  // Appointment APIs
├── messages.js      // Messaging APIs
├── files.js         // File upload/download APIs
├── notes.js         // Student notes APIs
├── notifications.js // Notification APIs
└── analytics.js     // Analytics APIs
```

**React Query Integration:**
- Custom hooks for each API endpoint
- Optimistic updates for better UX
- Background refetching and caching
- Error handling and retry logic

### Socket.io Integration

**Real-time Events:**
```javascript
// Client-side events
socket.emit('join-conversation', conversationId)
socket.emit('send-message', messageData)
socket.emit('typing', { conversationId, isTyping })

// Server-side events  
socket.on('message-received', messageData)
socket.on('user-online', userId)
socket.on('user-offline', userId)
socket.on('notification', notificationData)
socket.on('typing-indicator', { userId, isTyping })
```

## Data Models

### User Profile Management

**Role-based Profile Access:**
- **Students/Counselors:** Can only change password
- **Chairpersons:** Can edit all user profiles except admins
- **Admins:** Can edit all user profiles and create chairpersons

**Profile Update Flow:**
1. Frontend checks user role and displays appropriate form fields
2. API validates role permissions before allowing updates
3. Password changes require current password verification
4. Profile updates trigger audit logs for admin actions

### Appointment Management

**Appointment Workflow:**
1. Student views counselor availability
2. Student selects time slot and books appointment
3. System creates appointment and sends notifications
4. Counselors can confirm/reschedule appointments
5. Both parties can cancel with proper notifications

**Filtering System:**
- Single view with comprehensive filters (no tabs)
- Filter by status, date range, counselor, appointment type
- Real-time updates via Socket.io

### Messaging and Resources

**Conversation Structure:**
- Each conversation has participants and message history
- Resources tab separate from chat interface
- Single file upload with immediate sharing to all participants
- File deletion removes from all participants' view

**Message Flow:**
1. User sends message via Socket.io
2. Server validates and stores message
3. Server broadcasts to conversation participants
4. Recipients receive real-time notification

## Error Handling

### API Error Responses

**Standardized Error Format:**
```javascript
{
  success: false,
  error: {
    code: 'VALIDATION_ERROR',
    message: 'User-friendly error message',
    details: {} // Additional error details for debugging
  }
}
```

**Error Categories:**
- Authentication errors (401)
- Authorization errors (403)  
- Validation errors (400)
- Not found errors (404)
- Server errors (500)

### Frontend Error Handling

**React Query Error Handling:**
- Global error boundary for unhandled errors
- Toast notifications for user-facing errors
- Retry logic for network failures
- Fallback UI for failed data loads

**Socket.io Error Handling:**
- Connection failure handling
- Message delivery confirmation
- Automatic reconnection logic
- Offline message queuing

## Testing Strategy

### Backend Testing

**Unit Tests:**
- API route handlers
- Database operations
- Authentication middleware
- Validation schemas

**Integration Tests:**
- Complete API workflows
- Database transactions
- Socket.io event handling
- File upload/download

### Frontend Testing

**Component Tests:**
- Individual component rendering
- User interaction handling
- Form validation
- Error state handling

**Integration Tests:**
- API integration with React Query
- Socket.io connection and events
- End-to-end user workflows
- Role-based access control

### Test Data Management

**Database Seeding:**
- Test users for each role
- Sample appointments and conversations
- Mock file uploads
- Notification test data

**Environment Setup:**
- Separate test database
- Mock Socket.io server
- File upload test directory
- Environment variable configuration

## Security Considerations

### Authentication & Authorization

**JWT Implementation:**
- Single JWT token with reasonable expiration (24 hours)
- Token storage in localStorage (current implementation)
- Role-based route protection
- Re-authentication required on token expiration

**Role-based Access Control:**
- Middleware for route protection
- Frontend route guards
- API endpoint authorization
- Data filtering based on user role

### File Upload Security

**File Validation:**
- File type restrictions
- File size limits
- Virus scanning (future enhancement)
- Secure file storage outside web root

**Access Control:**
- Conversation-based file access
- User permission validation
- Secure file serving with proper headers
- File deletion authorization

### Data Protection

**Input Validation:**
- Zod schemas for all API inputs
- SQL injection prevention via Prisma
- XSS protection with proper sanitization
- CSRF protection for state-changing operations

**Privacy Controls:**
- Student notes privacy settings
- Conversation participant validation
- Profile data access restrictions
- Audit logging for sensitive operations