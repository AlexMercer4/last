import { Calendar, Clock, User, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatTime } from "@/lib/utils";

export default function AppointmentCard({
  appointment = {},
  userRole,
  onReschedule,
  onCancel,
  onComplete,
}) {
  // Defensive checks
  if (!appointment) {
    console.error("AppointmentCard: appointment prop is null or undefined");
    return null;
  }

  // Normalize status
  const normalizeStatus = (status) => {
    if (!status) return 'unknown';
    return status.toLowerCase();
  };

  const getStatusColor = (status) => {
    const normalizedStatus = normalizeStatus(status);
    switch (normalizedStatus) {
      case "scheduled":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getBorderColor = (status) => {
    const normalizedStatus = normalizeStatus(status);
    switch (normalizedStatus) {
      case "scheduled":
        return "border-l-blue-500";
      case "pending":
        return "border-l-yellow-500";
      case "completed":
        return "border-l-green-500";
      case "cancelled":
        return "border-l-red-500";
      default:
        return "border-l-gray-500";
    }
  };

  const normalizedAppointmentStatus = normalizeStatus(appointment.status);

  const canReschedule = 
    normalizedAppointmentStatus === "scheduled" || 
    normalizedAppointmentStatus === "pending";
  
  const canCancel = 
    normalizedAppointmentStatus === "scheduled" || 
    normalizedAppointmentStatus === "pending";
  
  const canComplete = 
    userRole === "counselor" && 
    normalizedAppointmentStatus === "scheduled";

  return (
    <Card
      className={`border-l-4 ${getBorderColor(
        appointment.status
      )} hover:shadow-md transition-shadow duration-200`}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="font-medium text-gray-900">
              {formatDate(appointment.date)}
            </span>
          </div>
          <Badge className={getStatusColor(appointment.status)}>
            {appointment.status ?
              appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1).toLowerCase()
              : 'Unknown'
            }
          </Badge>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2 text-gray-600">
            <Clock className="h-4 w-4" />
            <span>
              {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
              {appointment.duration && (
                <span className="text-sm text-gray-500 ml-2">
                  ({appointment.duration} mins)
                </span>
              )}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <User className="h-4 w-4" />
            <span>
              {userRole === "student"
                ? appointment.counselor?.name || "No counselor assigned"
                : appointment.student?.name || "No student assigned"}
            </span>
          </div>
          {appointment.location && (
            <div className="flex items-center space-x-2 text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{appointment.location}</span>
            </div>
          )}
          {appointment.type && (
            <div className="flex items-center space-x-2 text-gray-600">
              <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                {appointment.type}
              </span>
            </div>
          )}
        </div>

        {appointment.notes && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
              <strong>Notes:</strong> {appointment.notes}
            </p>
          </div>
        )}

        <div className="flex space-x-2">
          {canReschedule && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onReschedule(appointment)}
            >
              Reschedule
            </Button>
          )}
          {canCancel && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onCancel(appointment)}
            >
              Cancel
            </Button>
          )}
          {canComplete && (
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700"
              onClick={() => onComplete?.(appointment)}
            >
              Complete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}