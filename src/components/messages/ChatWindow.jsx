import { useEffect, useRef } from "react";
import { MoreVertical, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatMessage from "./ChatMessage";
import MessageInput from "./MessageInput";

export default function ChatWindow({
  conversation,
  messages,
  currentUserId,
  onSendMessage,
}) {
  const messagesEndRef = useRef(null);
  const otherParticipant = conversation.participants.find(
    (p) => p.id !== currentUserId
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Chat Header */}
      <div className="bg-[#ffbc3b] text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium">
                {otherParticipant?.name.charAt(0) || "U"}
              </span>
            </div>
            {otherParticipant?.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>

          <div>
            <h3 className="font-medium">
              {otherParticipant?.name || "Unknown User"}
            </h3>
            <p className="text-sm text-white/80">
              {otherParticipant?.isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10"
          >
            <FolderOpen className="h-4 w-4 mr-2" />
            Resources (2)
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
          {messages.map((message) => {
            const sender = conversation.participants.find(
              (p) => p.id === message.senderId
            );
            return (
              <ChatMessage
                key={message.id}
                message={message}
                isOwn={message.senderId === currentUserId}
                sender={sender}
              />
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <MessageInput onSendMessage={onSendMessage} />
    </div>
  );
}
