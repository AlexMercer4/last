import { useEffect, useRef, useState } from "react";
import { MoreVertical, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatMessage from "./ChatMessage";
import MessageInput from "./MessageInput";
import TypingIndicator from "./TypingIndicator";
import ResourcesTab from "./ResourcesTab";
import { useSocket } from "@/contexts/SocketContext";
import { useRealtimeMessages } from "@/hooks/useRealtimeMessages";
import { useConversationFiles } from "@/hooks/useFiles";

export default function ChatWindow({
  conversation,
  messages,
  currentUserId,
  onSendMessage,
}) {
  const messagesEndRef = useRef(null);
  const [showResourcesTab, setShowResourcesTab] = useState(false);
  const { isUserOnline, onlineUsers } = useSocket();
  const { getTypingUsers } = useRealtimeMessages(conversation.id);
  const { data: files = [] } = useConversationFiles(conversation.id);

  const otherParticipant = conversation?.participants?.find(
    (p) => p.userId !== currentUserId
  );

  // Get the other participant's user ID consistently
  const otherParticipantUserId = otherParticipant?.userId || otherParticipant?.user?.id;

  // Check if other participant is online using Socket.io
  const isOtherParticipantOnline = otherParticipantUserId ? isUserOnline(otherParticipantUserId) : false;

  // Debug logging
  // console.log('Online status check:', {
  //   otherParticipantUserId,
  //   isOtherParticipantOnline,
  //   onlineUsers: Array.from(onlineUsers || [])
  // });

  // Get typing users for this conversation
  const typingUsers = Array.from(getTypingUsers(conversation?.id) || [])
    .filter(user => user.userId !== currentUserId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Chat Header */}
      <div className="bg-[#ffbc3b] text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium">
                {otherParticipant?.user?.name?.charAt(0) || "U"}
              </span>
            </div>
            {isOtherParticipantOnline && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>

          <div>
            <h3 className="font-medium">
              {otherParticipant?.user?.name || "Unknown User"}
            </h3>
            <p className="text-sm text-white/80">
              {isOtherParticipantOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10"
            onClick={() => setShowResourcesTab(true)}
          >
            <FolderOpen className="h-4 w-4 mr-2" />
            Resources ({files.length})
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <div className="space-y-4">
          {messages?.slice().reverse().map((message) => {
            const participant = conversation?.participants?.find(
              (p) => p.userId === message.senderId
            );
            const sender = participant?.user || message.sender;
            return (
              <ChatMessage
                key={message.id}
                message={message}
                isOwn={message.senderId === currentUserId}
                sender={sender}
              />
            );
          })}
          {/* Typing Indicator */}
          <TypingIndicator typingUsers={typingUsers} />
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <MessageInput
        onSendMessage={onSendMessage}
        conversationId={conversation.id}
      />

      {/* Resources Tab Modal */}
      {showResourcesTab && (
        <ResourcesTab
          conversationId={conversation.id}
          onClose={() => setShowResourcesTab(false)}
        />
      )}
    </div>
  );
}
