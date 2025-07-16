import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const socketRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    if (isAuthenticated && user && !socketRef.current) {
      console.log('🔌 Initializing Socket.io connection for user:', user.id);
      
      const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
        auth: {
          token: localStorage.getItem('authToken'),
          userId: user.id,
        },
        transports: ['websocket', 'polling'],
      });

      socketRef.current = newSocket;
      setSocket(newSocket);

      // Connection event handlers
      newSocket.on('connect', () => {
        console.log('✅ Socket connected:', newSocket.id);
        setIsConnected(true);
        
        // Authenticate user with the server
        newSocket.emit('authenticate', user.id);
        console.log('🔐 User authenticated:', user.id);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
      });

      // User status events
      newSocket.on('user-online', (userId) => {
        setOnlineUsers(prev => new Set([...prev, userId]));
      });

      newSocket.on('user-offline', (userId) => {
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      });

      // Online users list update
      newSocket.on('online-users', (users) => {
        setOnlineUsers(new Set(users));
      });

      // Note: Real-time notification events are now handled by NotificationProvider

      return () => {
        newSocket.close();
      };
    }
  }, [isAuthenticated, user]);

  // Cleanup on logout
  useEffect(() => {
    if (!isAuthenticated && socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
      setOnlineUsers(new Set());
    }
  }, [isAuthenticated]);

  // Socket utility functions
  const joinConversation = (conversationId) => {
    if (socket) {
      socket.emit('join-conversation', conversationId);
    }
  };

  const leaveConversation = (conversationId) => {
    if (socket) {
      socket.emit('leave-conversation', conversationId);
    }
  };

  const sendMessage = (messageData) => {
    if (socket) {
      socket.emit('send-message', messageData);
    }
  };

  const emitTyping = (conversationId, isTyping) => {
    if (socket) {
      socket.emit('typing', { conversationId, isTyping });
    }
  };

  const isUserOnline = (userId) => {
    return onlineUsers.has(userId);
  };

  const value = {
    socket,
    isConnected,
    onlineUsers,
    joinConversation,
    leaveConversation,
    sendMessage,
    emitTyping,
    isUserOnline,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};