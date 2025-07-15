import { User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function MessageCard({ 
  sender, 
  message, 
  timestamp, 
  isUnread = false 
}) {
  return (
    <Card className={`border-l-4 border-l-blue-400 hover:shadow-md transition-shadow duration-200 ${isUnread ? 'bg-blue-50' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="bg-gray-200 p-2 rounded-full">
            <User className="h-4 w-4 text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium text-gray-900">{sender}</p>
              <p className="text-xs text-gray-500">{timestamp}</p>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">{message}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}