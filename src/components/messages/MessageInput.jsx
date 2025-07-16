import { useState, useRef, useEffect, useCallback } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSocket } from "@/contexts/SocketContext";

export default function MessageInput({ onSendMessage, disabled = false, conversationId }) {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const { emitTyping } = useSocket();

  // Handle typing indicator
  const handleTyping = useCallback((value) => {
    if (!conversationId || !emitTyping) return;

    if (value.trim() && !isTyping) {
      setIsTyping(true);
      emitTyping(conversationId, true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        emitTyping(conversationId, false);
      }
    }, 1000);
  }, [conversationId, emitTyping, isTyping]);

  // Stop typing when component unmounts
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTyping && conversationId && emitTyping) {
        emitTyping(conversationId, false);
      }
    };
  }, [isTyping, conversationId, emitTyping]);

  const handleSend = () => {
    if (message.trim()) {
      // Stop typing indicator when sending
      if (isTyping && conversationId && emitTyping) {
        setIsTyping(false);
        emitTyping(conversationId, false);
      }
      
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleMessageChange = (e) => {
    const value = e.target.value;
    setMessage(value);
    handleTyping(value);
  };



  return (
    <div className="border-t border-gray-200 p-4 bg-white">
      <div className="flex items-end space-x-2">
        <div className="flex-1">
          <Textarea
            value={message}
            onChange={handleMessageChange}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={disabled}
            className="min-h-[40px] max-h-32 resize-none border-gray-200 focus:border-[#0056b3] focus:ring-[#0056b3]"
            rows={1}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Button
            onClick={handleSend}
            disabled={disabled || !message.trim()}
            size="sm"
            className="bg-[#0056b3] hover:bg-[#004494]"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
