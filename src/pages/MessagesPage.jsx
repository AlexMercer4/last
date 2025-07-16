import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";
import ConversationList from "@/components/messages/ConversationList";
import ChatWindow from "@/components/messages/ChatWindow";
import { useAuth } from "@/contexts/AuthContext";
import { useSocket } from "@/contexts/SocketContext";
import { useRealtimeMessages } from "@/hooks/useRealtimeMessages";
import { useConversations, useCreateConversation, useSendMessage, useConversationMessages } from "@/hooks/useMessages";
import { OnlineUsersList } from "@/components/ui/online-status";
import { ConnectionStatus } from "@/components/ui/connection-status";

export default function MessagesPage() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { isConnected } = useSocket();
  const userRole = user?.role;
  const currentUserId = user?.id;

  // Real-time hooks
  const { data: conversations = [], isLoading: conversationsLoading } = useConversations();
  const createConversationMutation = useCreateConversation();
  const sendMessageMutation = useSendMessage();
  
  // State for active conversation
  const [activeConversationId, setActiveConversationId] = useState(null);
  
  // Get messages for active conversation
  const { data: messagesData, isLoading: messagesLoading } = useConversationMessages(activeConversationId);
  const conversationMessages = messagesData?.messages || [];
  
  // Initialize real-time messaging for active conversation
  useRealtimeMessages(activeConversationId);

  // Check for userId in URL params and start conversation if needed
  useEffect(() => {
    const userId = searchParams.get("userId");
    if (userId && conversations.length > 0) {
      handleStartConversation(userId);
    }
  }, [searchParams, conversations]);

  // Ensure conversations is an array before using find
  const conversationsArray = Array.isArray(conversations) ? conversations : [];
  const activeConversation = conversationsArray.find(
    (c) => c.id === activeConversationId
  );

  const handleSendMessage = async (content) => {
    if (!activeConversationId || !content.trim()) return;

    try {
      await sendMessageMutation.mutateAsync({
        conversationId: activeConversationId,
        messageData: {
          content: content.trim(),
          senderId: currentUserId,
        },
      });
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleStartConversation = async (userId) => {
    try {
      console.log('Starting conversation with userId:', userId);
      console.log('Current conversations:', conversationsArray);
      
      // Check if conversation already exists
      const existingConversation = conversationsArray.find((conv) =>
        conv.participants && conv.participants.some((p) => p.userId === userId)
      );

      console.log('Existing conversation found:', existingConversation);

      if (existingConversation) {
        setActiveConversationId(existingConversation.id);
        return;
      }

      // Create new conversation using the API
      console.log('Creating new conversation with participantIds:', [userId]);
      const newConversation = await createConversationMutation.mutateAsync({
        participantIds: [userId],
      });

      console.log('New conversation created:', newConversation);
      setActiveConversationId(newConversation.id);
    } catch (error) {
      console.error('Failed to start conversation:', error);
      toast.error('Failed to start conversation. Please try again.');
    }
  };

  // Check if user can access messaging
  if (userRole === "chairperson") {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Messages Not Available
            </h2>
            <p className="text-gray-600">
              Chairpersons do not have access to direct messaging. Please use
              the reporting and analytics features instead.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Messages & Resources
              </h1>
              <p className="text-gray-600 mt-2">
                Communicate with your{" "}
                {userRole === "student" ? "counselors" : "students"} and share
                resources in real-time.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <ConnectionStatus showText={true} />
            </div>
          </div>
        </div>

        {/* Messages Interface */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[calc(100vh-200px)] flex">
          {/* Conversation List */}
          <ConversationList
            conversations={conversationsArray}
            activeConversationId={activeConversationId}
            onConversationSelect={setActiveConversationId}
            currentUserId={currentUserId}
            userRole={userRole}
            onStartConversation={handleStartConversation}
          />

          {/* Chat Window */}
          {activeConversation ? (
            <ChatWindow
              conversation={activeConversation}
              messages={conversationMessages}
              currentUserId={currentUserId}
              onSendMessage={handleSendMessage}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a conversation
                </h3>
                <p className="text-gray-500">
                  Choose a conversation from the list to start messaging.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
