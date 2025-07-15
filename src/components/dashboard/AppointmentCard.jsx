import { Calendar, Clock, User, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AppointmentCard({ 
  date, 
  time, 
  counselor, 
  location, 
  status 
}) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="border-l-4 border-l-yellow-400 hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="font-medium text-gray-900">{date}</span>
          </div>
          <Badge className={getStatusColor(status)}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2 text-gray-600">
            <Clock className="h-4 w-4" />
            <span>{time}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <User className="h-4 w-4" />
            <span>{counselor}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>{location}</span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button size="sm" className="bg-[#0056b3] hover:bg-[#004494]">
            Reschedule
          </Button>
          <Button size="sm" variant="destructive">
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}