import express from "express";
import cookieParser from "cookie-parser";
import "dotenv/config";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import { socketMiddleware } from "./middlewares/socketMiddleware.js";

const app = express();
const server = createServer(app);

// Configure Socket.io
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
    credentials: true,
  },
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);

// Store connected users for online/offline tracking
const connectedUsers = new Map();

// Make Socket.io and connected users available to all routes
app.use(socketMiddleware(io, connectedUsers));

// Make connectedUsers available to socket utils
io.connectedUsers = connectedUsers;

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/notifications", notificationRoutes);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user authentication and online status
  socket.on('authenticate', (userId) => {
    socket.userId = userId;
    connectedUsers.set(userId, {
      socketId: socket.id,
      lastSeen: new Date(),
      isOnline: true
    });
    
    // Send current online users list to the newly connected user
    const onlineUserIds = Array.from(connectedUsers.keys()).filter(id => 
      connectedUsers.get(id).isOnline
    );
    socket.emit('online-users', onlineUserIds);
    
    // Broadcast user online status to other users
    socket.broadcast.emit('user-online', userId);
    console.log(`User ${userId} is now online`);
  });

  // Handle joining conversation rooms
  socket.on('join-conversation', (conversationId) => {
    socket.join(`conversation-${conversationId}`);
    console.log(`User ${socket.userId} joined conversation ${conversationId}`);
  });

  // Handle leaving conversation rooms
  socket.on('leave-conversation', (conversationId) => {
    socket.leave(`conversation-${conversationId}`);
    console.log(`User ${socket.userId} left conversation ${conversationId}`);
  });

  // Handle real-time messaging
  socket.on('send-message', (messageData) => {
    // Broadcast message to all users in the conversation
    socket.to(`conversation-${messageData.conversationId}`).emit('message-received', {
      id: messageData.id,
      content: messageData.content,
      senderId: messageData.senderId,
      conversationId: messageData.conversationId,
      createdAt: messageData.createdAt,
      sender: messageData.sender
    });
    console.log(`Message sent in conversation ${messageData.conversationId}`);
  });

  // Handle typing indicators
  socket.on('typing', ({ conversationId, isTyping }) => {
    socket.to(`conversation-${conversationId}`).emit('typing-indicator', {
      userId: socket.userId,
      isTyping
    });
  });

  // Handle notification broadcasting
  socket.on('send-notification', (notificationData) => {
    console.log('📨 Received send-notification event:', notificationData);
    const targetUser = connectedUsers.get(notificationData.userId);
    console.log('🎯 Target user info:', targetUser);
    
    if (targetUser && targetUser.isOnline) {
      io.to(targetUser.socketId).emit('notification', notificationData);
      console.log(`✅ Notification sent to user ${notificationData.userId} via socket ${targetUser.socketId}`);
    } else {
      console.log(`⚠️ User ${notificationData.userId} is not online or not found`);
    }
  });

  // Handle file sharing events
  socket.on('file-shared', (fileData) => {
    socket.to(`conversation-${fileData.conversationId}`).emit('file-shared', fileData);
    console.log(`File shared in conversation ${fileData.conversationId}`);
  });

  // Handle file deletion events
  socket.on('file-deleted', (deletionData) => {
    socket.to(`conversation-${deletionData.conversationId}`).emit('file-deleted', deletionData);
    console.log(`File deleted in conversation ${deletionData.conversationId}`);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    if (socket.userId) {
      const userInfo = connectedUsers.get(socket.userId);
      if (userInfo) {
        userInfo.isOnline = false;
        userInfo.lastSeen = new Date();
        
        // Broadcast user offline status
        socket.broadcast.emit('user-offline', socket.userId);
        console.log(`User ${socket.userId} is now offline`);
        
        // Remove from connected users after a delay (in case of reconnection)
        setTimeout(() => {
          const currentUserInfo = connectedUsers.get(socket.userId);
          if (currentUserInfo && !currentUserInfo.isOnline) {
            connectedUsers.delete(socket.userId);
          }
        }, 30000); // 30 seconds delay
      }
    }
    console.log('User disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

// Server start
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('Socket.io server is ready for connections');
});
