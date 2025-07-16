import { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCounselorAvailability } from "@/hooks/useAppointments";

export default function RescheduleAppointmentDialog({
  open,
  onOpenChange,
  appointment,
  onSubmit,
}) {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch availability for the counselor
  const { data: availabilityData } = useCounselorAvailability(
    appointment?.counselorId, 
    selectedDate
  );

  // Initialize form with current appointment data
  useEffect(() => {
    if (appointment && open) {
      setSelectedDate(appointment.date || "");
      setSelectedTime(appointment.startTime || "");
      setLocation(appointment.location || "");
      setNotes(appointment.notes || "");
    }
  }, [appointment, open]);

  // Generate time slots based on availability or use default slots
  const defaultTimeSlots = [
    { time: "09:00", label: "09:00 AM", available: true },
    { time: "10:00", label: "10:00 AM", available: true },
    { time: "11:00", label: "11:00 AM", available: true },
    { time: "14:00", label: "02:00 PM", available: true },
    { time: "15:00", label: "03:00 PM", available: true },
    { time: "16:00", label: "04:00 PM", available: true },
  ];

  const timeSlots = availabilityData?.timeSlots || defaultTimeSlots;

  const locations = [
    "Room 201, Counseling Center",
    "Room 105, Student Services",
    "Room 303, Academic Block",
    "Room 202, Counseling Center",
    "Online Meeting",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Calculate end time (assuming 1 hour duration by default)
    const startTime = selectedTime;
    const [hours, minutes] = startTime.split(':');
    const startHour = parseInt(hours);
    const endHour = startHour + 1;
    const endTime = `${endHour.toString().padStart(2, '0')}:${minutes}`;

    const updateData = {
      date: selectedDate,
      startTime: startTime,
      endTime: endTime,
      duration: 60, // 60 minutes default
      location,
      notes,
    };

    try {
      await onSubmit(appointment.id, updateData);
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Error rescheduling appointment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedDate("");
    setSelectedTime("");
    setLocation("");
    setNotes("");
  };

  const isFormValid = selectedDate && selectedTime && location;

  if (!appointment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-[#0056b3]" />
            <span>Reschedule Appointment</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date Selection */}
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>New Date</span>
              </Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>

            {/* Time Selection */}
            <div className="space-y-2">
              <Label className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>New Time</span>
              </Label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem
                      key={slot.time}
                      value={slot.time}
                      disabled={!slot.available}
                    >
                      {slot.label || slot.time} {!slot.available && "(Unavailable)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>Location</span>
            </Label>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Notes (Optional)</span>
            </Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes or specific topics you'd like to discuss..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid || isLoading}
              className="bg-[#0056b3] hover:bg-[#004494]"
            >
              {isLoading ? "Rescheduling..." : "Reschedule Appointment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}