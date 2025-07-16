import { Check, CheckCheck } from "lucide-react";
import FileAttachmentCard from "./FileAttachmentCard";
import { formatMessageDate } from "@/utils/formatters";

export default function ChatMessage({ message, isOwn, sender }) {

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-4`}>
      <div className={`max-w-xs lg:max-w-md ${isOwn ? "order-2" : "order-1"}`}>
        {!isOwn && sender && (
          <p className="text-xs text-gray-600 mb-1 px-1">{sender.name}</p>
        )}

        <div
          className={`rounded-lg px-4 py-2 ${
            isOwn ? "bg-[#0056b3] text-white" : "bg-gray-100 text-gray-900"
          }`}
        >
          {message.content && (
            <p className="text-sm leading-relaxed">{message.content}</p>
          )}

          {message.attachment && (
            <div className="mt-2">
              <FileAttachmentCard attachment={message.attachment} />
            </div>
          )}
        </div>

        <div
          className={`flex items-center mt-1 space-x-1 ${
            isOwn ? "justify-end" : "justify-start"
          }`}
        >
          <span className="text-xs text-gray-500">
            {formatMessageDate(message.createdAt || message.timestamp)}
          </span>
          {isOwn && (
            <div className="text-gray-400">
              {message.isRead ? (
                <CheckCheck className="h-3 w-3 text-blue-500" />
              ) : (
                <Check className="h-3 w-3" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
