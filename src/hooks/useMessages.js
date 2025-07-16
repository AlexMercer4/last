import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { messagesApi } from '@/api/messages';
import { toast } from 'sonner';

// Query keys
export const messageKeys = {
  all: ['messages'],
  conversations: () => [...messageKeys.all, 'conversations'],
  conversation: (id) => [...messageKeys.conversations(), id],
  messages: (conversationId, page) => [...messageKeys.conversation(conversationId), 'messages', page],
};

// Get user conversations
export const useConversations = () => {
  return useQuery({
    queryKey: messageKeys.conversations(),
    queryFn: messagesApi.getConversations,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Get conversation messages with pagination
export const useConversationMessages = (conversationId, page = 1, limit = 50) => {
  return useQuery({
    queryKey: messageKeys.messages(conversationId, page),
    queryFn: () => messagesApi.getConversationMessages(conversationId, page, limit),
    enabled: !!conversationId,
    staleTime: 1000 * 30, // 30 seconds
    keepPreviousData: true, // Keep previous pages while loading new ones
  });
};

// Create conversation mutation
export const useCreateConversation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: messagesApi.createConversation,
    onSuccess: (newConversation) => {
      // Add to conversations list
      queryClient.setQueryData(messageKeys.conversations(), (old) => {
        if (!old) return [newConversation];
        return [newConversation, ...old];
      });
      
      toast.success('Conversation started');
    },
    onError: (error) => {
      const message = error.response?.data?.error?.message || 'Failed to start conversation';
      toast.error(message);
    },
  });
};

// Send message mutation
export const useSendMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ conversationId, messageData }) => 
      messagesApi.sendMessage(conversationId, messageData),
    onMutate: async ({ conversationId, messageData }) => {
      // Cancel outgoing refetches for this conversation
      await queryClient.cancelQueries({ 
        queryKey: messageKeys.messages(conversationId, 1) 
      });
      
      // Snapshot previous value
      const previousMessages = queryClient.getQueryData(messageKeys.messages(conversationId, 1));
      
      // Create optimistic message
      const optimisticMessage = {
        id: `temp-${Date.now()}`,
        content: messageData.content,
        senderId: messageData.senderId,
        conversationId,
        isRead: false,
        createdAt: new Date().toISOString(),
        sender: { name: 'You' }, // Will be replaced with real data
        isOptimistic: true,
      };
      
      // Optimistically update messages (add to beginning since backend returns newest first)
      queryClient.setQueryData(messageKeys.messages(conversationId, 1), (old) => {
        if (!old) return { messages: [optimisticMessage], hasMore: false };
        return {
          ...old,
          messages: [optimisticMessage, ...old.messages],
        };
      });
      
      // Update conversation list to show latest message
      queryClient.setQueryData(messageKeys.conversations(), (old) => {
        if (!old) return old;
        return old.map(conv => 
          conv.id === conversationId 
            ? { ...conv, lastMessage: optimisticMessage, updatedAt: optimisticMessage.createdAt }
            : conv
        );
      });
      
      return { previousMessages, conversationId };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousMessages) {
        queryClient.setQueryData(
          messageKeys.messages(context.conversationId, 1), 
          context.previousMessages
        );
      }
      
      const message = error.response?.data?.error?.message || 'Failed to send message';
      toast.error(message);
    },
    onSuccess: (newMessage, { conversationId }) => {
      // Replace optimistic message with real one (maintain newest first order)
      queryClient.setQueryData(messageKeys.messages(conversationId, 1), (old) => {
        if (!old) return { messages: [newMessage], hasMore: false };
        
        // Remove optimistic message and add real one at the beginning
        const filteredMessages = old.messages.filter(msg => !msg.isOptimistic);
        
        // Check if message already exists to avoid duplicates
        const messageExists = filteredMessages.some(msg => msg.id === newMessage.id);
        if (messageExists) {
          return { ...old, messages: filteredMessages };
        }
        
        return {
          ...old,
          messages: [newMessage, ...filteredMessages],
        };
      });
      
      // Update conversations list
      queryClient.invalidateQueries({ queryKey: messageKeys.conversations() });
    },
    onSettled: (data, error, { conversationId }) => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ 
        queryKey: messageKeys.messages(conversationId, 1) 
      });
    },
  });
};

// Mark message as read mutation
export const useMarkMessageAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: messagesApi.markMessageAsRead,
    onSuccess: (data, messageId) => {
      // Update message in cache
      queryClient.setQueriesData(
        { queryKey: messageKeys.all },
        (old) => {
          if (!old?.messages) return old;
          return {
            ...old,
            messages: old.messages.map(msg => 
              msg.id === messageId ? { ...msg, isRead: true } : msg
            ),
          };
        }
      );
    },
    onError: (error) => {
      console.error('Failed to mark message as read:', error);
    },
  });
};

// Mark conversation as read mutation
export const useMarkConversationAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: messagesApi.markConversationAsRead,
    onSuccess: (data, conversationId) => {
      // Update all messages in conversation as read
      queryClient.setQueriesData(
        { queryKey: messageKeys.conversation(conversationId) },
        (old) => {
          if (!old?.messages) return old;
          return {
            ...old,
            messages: old.messages.map(msg => ({ ...msg, isRead: true })),
          };
        }
      );
      
      // Update conversation in list
      queryClient.setQueryData(messageKeys.conversations(), (old) => {
        if (!old) return old;
        return old.map(conv => 
          conv.id === conversationId 
            ? { ...conv, unreadCount: 0 }
            : conv
        );
      });
    },
    onError: (error) => {
      console.error('Failed to mark conversation as read:', error);
    },
  });
};