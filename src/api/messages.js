import axiosInstance from '@/lib/axiosInstance';

export const messagesApi = {
  // Get user conversations
  getConversations: async () => {
    const response = await axiosInstance.get('/messages/conversations');
    return response.data.data.conversations; // Return the conversations array
  },

  // Create/start conversation
  createConversation: async ({ participantIds }) => {
    const response = await axiosInstance.post('/messages/conversations', {
      participantIds
    });
    return response.data.data.conversation; // Return the conversation object
  },

  // Get conversation messages with pagination
  getConversationMessages: async (conversationId, page = 1, limit = 50) => {
    const response = await axiosInstance.get(
      `/messages/conversations/${conversationId}/messages?page=${page}&limit=${limit}`
    );
    return response.data.data; // Return the data object with messages and pagination
  },

  // Send message
  sendMessage: async (conversationId, messageData) => {
    const response = await axiosInstance.post(
      `/messages/conversations/${conversationId}/messages`,
      messageData
    );
    return response.data.data.message; // Return the message object
  },

  // Mark message as read
  markMessageAsRead: async (messageId) => {
    const response = await axiosInstance.put(`/messages/${messageId}/read`);
    return response.data.data; // Return the data object
  },

  // Mark all messages in conversation as read
  markConversationAsRead: async (conversationId) => {
    const response = await axiosInstance.put(`/messages/conversations/${conversationId}/read-all`);
    return response.data.data; // Return the data object
  },
};