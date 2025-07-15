import { Calendar, Clock, User, MapPin, MoreVertical } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AppointmentCard({
  appointment,
  userRole,
  onReschedule,
  onCancel,
  onComplete,
}) {
  const getStatusColor = (status) => {
    switch (status) {
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
    switch (status) {
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

  const canReschedule =
    appointment.status === "scheduled" || appointment.status === "pending";
  const canCancel =
    appointment.status === "scheduled" || appointment.status === "pending";
  const canComplete =
    userRole === "counselor" && appointment.status === "scheduled";

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
              {appointment.date}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(appointment.status)}>
              {appointment.status.charAt(0).toUpperCase() +
                appointment.status.slice(1)}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canReschedule && (
                  <DropdownMenuItem onClick={() => onReschedule(appointment)}>
                    Reschedule
                  </DropdownMenuItem>
                )}
                {canComplete && (
                  <DropdownMenuItem onClick={() => onComplete?.(appointment)}>
                    Mark as Completed
                  </DropdownMenuItem>
                )}
                {canCancel && (
                  <DropdownMenuItem
                    onClick={() => onCancel(appointment)}
                    className="text-red-600"
                  >
                    Cancel
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2 text-gray-600">
            <Clock className="h-4 w-4" />
            <span>{appointment.time}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <User className="h-4 w-4" />
            <span>
              {userRole === "student"
                ? appointment.counselor
                : appointment.student || "No student assigned"}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>{appointment.location}</span>
          </div>
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
              className="bg-[#0056b3] hover:bg-[#004494]"
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
        </div>
      </CardContent>
    </Card>
  );
}
