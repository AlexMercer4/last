# Socket.io Events Documentation

## Client-to-Server Events

### Authentication
- `authenticate` - User provides their userId to establish online status
  - Payload: `userId` (string)
  - Response: Broadcasts `user-online` event to other users

### Conversation Management
- `join-conversation` - User joins a conversation room
  - Payload: `conversationId` (string)
  - Effect: User joins room `conversation-${conversationId}`

- `leave-conversation` - User leaves a conversation room
  - Payload: `conversationId` (string)
  - Effect: User leaves room `conversation-${conversationId}`

### Messaging
- `send-message` - Send a real-time message
  - Payload: `messageData` object with:
    - `id` - Message ID
    - `content` - Message content
    - `senderId` - Sender user ID
    - `conversationId` - Conversation ID
    - `createdAt` - Timestamp
    - `sender` - Sender user object
  - Response: Broadcasts `message-received` to conversation participants

- `typing` - Send typing indicator
  - Payload: `{ conversationId, isTyping }`
  - Response: Broadcasts `typing-indicator` to conversation participants

### Notifications
- `send-notification` - Send notification to specific user
  - Payload: `notificationData` object with:
    - `userId` - Target user ID
    - `title` - Notification title
    - `message` - Notification message
    - `type` - Notification type
    - `data` - Additional data
  - Response: Sends `notification` event to target user

## Server-to-Client Events

### User Status
- `user-online` - Broadcasted when user comes online
  - Payload: `userId` (string)

- `user-offline` - Broadcasted when user goes offline
  - Payload: `userId` (string)

### Messaging
- `message-received` - Real-time message delivery
  - Payload: Complete message object

- `typing-indicator` - Typing status from other users
  - Payload: `{ userId, isTyping }`

### File Sharing
- `file-shared` - Broadcasted when file is shared in conversation
  - Payload: `{ conversationId, file, uploaderName }`

### Notifications
- `notification` - Personal notification delivery
  - Payload: Notification object

- `system-notification` - System-wide notifications
  - Payload: System notification object

## Connection Management

### Connection
- User connects to Socket.io server
- Server logs connection with socket ID

### Disconnection
- User disconnects from server
- Server updates online status to offline
- Server broadcasts offline status
- Server removes user from connected users after 30-second delay

## Online Status Tracking

The server maintains a `connectedUsers` Map with:
- Key: `userId`
- Value: `{ socketId, lastSeen, isOnline }`

This allows for:
- Real-time online/offline status
- Message delivery to online users
- Notification broadcasting
- Connection state management