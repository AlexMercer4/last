import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from '@/contexts/SocketContext';
import { messageKeys } from './useMessages';

export const useRealtimeMessages = (activeConversationId) => {
  const { socket, joinConversation, leaveConversation } = useSocket();
  const queryClient = useQueryClient();

  // Handle real-time message receiving
  useEffect(() => {
    if (!socket) return;

    const handleMessageReceived = (messageData) => {
      const { conversationId } = messageData;
      
      // Update messages in the specific conversation (add to beginning since backend returns newest first)
      queryClient.setQueryData(messageKeys.messages(conversationId, 1), (old) => {
        if (!old) return { messages: [messageData], hasMore: false };
        
        // Check if message already exists (avoid duplicates)
        const messageExists = old.messages.some(msg => msg.id === messageData.id);
        if (messageExists) return old;
        
        return {
          ...old,
          messages: [messageData, ...old.messages],
        };
      });

      // Update conversations list to show latest message
      queryClient.setQueryData(messageKeys.conversations(), (old) => {
        if (!old) return old;
        
        return old.map(conv => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              lastMessage: messageData,
              updatedAt: messageData.createdAt,
              unreadCount: conv.id === activeConversationId ? 0 : (conv.unreadCount || 0) + 1,
            };
          }
          return conv;
        });
      });
    };

    const handleTypingIndicator = ({ userId, conversationId, isTyping, userName }) => {
      // Update typing indicators in the conversation
      queryClient.setQueryData(['typing', conversationId], (old) => {
        const typingUsers = old || new Set();
        if (isTyping) {
          typingUsers.add({ userId, userName });
        } else {
          typingUsers.delete({ userId, userName });
        }
        return new Set(typingUsers);
      });
    };

    const handleMessageDelivered = ({ messageId, conversationId }) => {
      // Update message delivery status
      queryClient.setQueryData(messageKeys.messages(conversationId, 1), (old) => {
        if (!old) return old;
        
        return {
          ...old,
          messages: old.messages.map(msg => 
            msg.id === messageId ? { ...msg, isDelivered: true } : msg
          ),
        };
      });
    };

    const handleMessageRead = ({ messageId, conversationId }) => {
      // Update message read status
      queryClient.setQueryData(messageKeys.messages(conversationId, 1), (old) => {
        if (!old) return old;
        
        return {
          ...old,
          messages: old.messages.map(msg => 
            msg.id === messageId ? { ...msg, isRead: true } : msg
          ),
        };
      });
    };

    // Register event listeners
    socket.on('message-received', handleMessageReceived);
    socket.on('typing-indicator', handleTypingIndicator);
    socket.on('message-delivered', handleMessageDelivered);
    socket.on('message-read', handleMessageRead);

    return () => {
      socket.off('message-received', handleMessageReceived);
      socket.off('typing-indicator', handleTypingIndicator);
      socket.off('message-delivered', handleMessageDelivered);
      socket.off('message-read', handleMessageRead);
    };
  }, [socket, queryClient, activeConversationId]);

  // Join/leave conversation when active conversation changes
  useEffect(() => {
    if (activeConversationId) {
      joinConversation(activeConversationId);
      
      return () => {
        leaveConversation(activeConversationId);
      };
    }
  }, [activeConversationId, joinConversation, leaveConversation]);

  // Get typing users for a conversation
  const getTypingUsers = useCallback((conversationId) => {
    return queryClient.getQueryData(['typing', conversationId]) || new Set();
  }, [queryClient]);

  return {
    getTypingUsers,
  };
};