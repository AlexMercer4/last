import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FileAttachmentCard({ attachment }) {
  const getFileIcon = (type) => {
    if (type.includes("pdf")) return "📄";
    if (type.includes("image")) return "🖼️";
    if (type.includes("video")) return "🎥";
    if (type.includes("audio")) return "🎵";
    return "📎";
  };

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-w-xs">
      <div className="flex items-center space-x-3">
        <div className="text-2xl">{getFileIcon(attachment.type)}</div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {attachment.name}
          </p>
          <p className="text-xs text-gray-500">{attachment.size}</p>
        </div>

        <div className="flex items-center">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Download className="h-4 w-4 text-gray-500" />
          </Button>
        </div>
      </div>

      <p className="text-xs text-gray-600 mt-2">
        Here's the academic planning guide I mentioned:
      </p>
    </div>
  );
}
