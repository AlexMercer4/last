import { useState } from "react";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ConversationItem from "./ConversationItem";
import StartConversationDialog from "./StartConversationDialog";

export default function ConversationList({
  conversations,
  activeConversationId,
  onConversationSelect,
  currentUserId,
  userRole,
  onStartConversation,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isStartConversationOpen, setIsStartConversationOpen] = useState(false);

  const filteredConversations = conversations.filter((conversation) => {
    const otherParticipant = conversation.participants.find(
      (p) => p.id !== currentUserId
    );
    return otherParticipant?.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
  });

  const canStartConversation =
    userRole === "student" || userRole === "counselor";

  const handleStartConversation = async (userId) => {
    try {
      await onStartConversation(userId);
    } catch (error) {
      console.error("Error starting conversation:", error);
    }
  };

  return (
    <div className="w-full lg:w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
          {canStartConversation && (
            <Button
              size="sm"
              className="bg-[#0056b3] hover:bg-[#004494]"
              onClick={() => setIsStartConversationOpen(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchQuery ? "No conversations found" : "No conversations yet"}
            {canStartConversation && !searchQuery && (
              <div className="mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsStartConversationOpen(true)}
                  className="text-[#0056b3] hover:text-[#004494]"
                >
                  Start your first conversation
                </Button>
              </div>
            )}
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isActive={conversation.id === activeConversationId}
              onClick={() => onConversationSelect(conversation.id)}
              currentUserId={currentUserId}
            />
          ))
        )}
      </div>

      {/* Start Conversation Dialog */}
      <StartConversationDialog
        open={isStartConversationOpen}
        onOpenChange={setIsStartConversationOpen}
        userRole={userRole}
        onStartConversation={handleStartConversation}
      />
    </div>
  );
}
