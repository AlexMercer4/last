import { User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSocket } from "@/contexts/SocketContext";
import { formatMessageDate } from "@/utils/formatters";

export default function ConversationItem({
  conversation,
  isActive,
  onClick,
  currentUserId,
}) {
  const { isUserOnline } = useSocket();
  const otherParticipant = conversation.participants.find(
    (p) => p.userId !== currentUserId
  );
  
  // Get the other participant's user ID consistently
  const otherParticipantUserId = otherParticipant?.userId || otherParticipant?.user?.id;
  
  // Check if other participant is online using Socket.io
  const isOtherParticipantOnline = otherParticipantUserId ? isUserOnline(otherParticipantUserId) : false;

  return (
    <div
      onClick={onClick}
      className={`p-4 cursor-pointer border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200 ${
        isActive ? "bg-blue-50 border-l-4 border-l-[#0056b3]" : ""
      }`}
    >
      <div className="flex items-start space-x-3">
        <div className="relative">
          <div className="bg-gray-200 p-2 rounded-full">
            <User className="h-5 w-5 text-gray-600" />
          </div>
          {isOtherParticipantOnline && (
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3
              className={`text-sm font-medium truncate ${
                conversation.unreadCount > 0 ? "text-gray-900" : "text-gray-700"
              }`}
            >
              {otherParticipant?.user?.name || "Unknown User"}
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">
                {conversation.lastMessage ? 
                  formatMessageDate(conversation.lastMessage.createdAt || conversation.updatedAt) : 
                  formatMessageDate(conversation.createdAt)
                }
              </span>
              {(conversation.unreadCount || 0) > 0 && (
                <Badge className="bg-[#0056b3] text-white text-xs px-2 py-1 rounded-full">
                  {conversation.unreadCount}
                </Badge>
              )}
            </div>
          </div>

          <p
            className={`text-sm truncate ${
              (conversation.unreadCount || 0) > 0
                ? "text-gray-900 font-medium"
                : "text-gray-500"
            }`}
          >
            {conversation.lastMessage ? 
              conversation.lastMessage.content || "No messages yet" : 
              "No messages yet"
            }
          </p>
        </div>
      </div>
    </div>
  );
}
