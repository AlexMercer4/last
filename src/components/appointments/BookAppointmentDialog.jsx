import { useState } from "react";
import { Calendar, Clock, User, MapPin, FileText } from "lucide-react";
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
import { useCounselors, useStudents } from "@/hooks/useUsers";
import { useCounselorAvailability } from "@/hooks/useAppointments";

export default function BookAppointmentDialog({
  open,
  onOpenChange,
  userRole,
  onSubmit,
}) {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedCounselor, setSelectedCounselor] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [appointmentType, setAppointmentType] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch real data from API
  const { data: counselorsData, isLoading: counselorsLoading } = useCounselors();
  const { data: studentsData, isLoading: studentsLoading } = useStudents();
  const { data: availabilityData, isLoading: availabilityLoading } = useCounselorAvailability(
    selectedCounselor, 
    selectedDate
  );

  // Ensure data is always an array
  const counselors = Array.isArray(counselorsData) 
    ? counselorsData 
    : counselorsData?.counselors || counselorsData?.data || [];
    
  const students = Array.isArray(studentsData) 
    ? studentsData 
    : studentsData?.students || studentsData?.data || [];

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

  const appointmentTypes = [
    { value: "COUNSELING", label: "General Counseling" },
    { value: "ACADEMIC", label: "Academic Guidance" },
    { value: "CAREER", label: "Career Counseling" },
    { value: "PERSONAL", label: "Personal Issues" },
  ];

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

    const appointmentData = {
      date: selectedDate,
      startTime: startTime,
      endTime: endTime,
      duration: 60, // 60 minutes default
      counselorId: userRole === "student" ? selectedCounselor : null,
      studentId: userRole === "counselor" ? selectedStudent : null,
      type: appointmentType,
      location,
      notes,
    };

    try {
      await onSubmit(appointmentData);
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Error booking appointment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedDate("");
    setSelectedTime("");
    setSelectedCounselor("");
    setSelectedStudent("");
    setAppointmentType("");
    setLocation("");
    setNotes("");
  };

  const isFormValid =
    selectedDate &&
    selectedTime &&
    appointmentType &&
    location &&
    (userRole === "student" ? selectedCounselor : selectedStudent);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-[#0056b3]" />
            <span>Book New Appointment</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date Selection */}
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Date</span>
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
                <span>Time</span>
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

          {/* Counselor/Student Selection */}
          {userRole === "student" ? (
            <div className="space-y-2">
              <Label className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Counselor</span>
              </Label>
              <Select
                value={selectedCounselor}
                onValueChange={setSelectedCounselor}
                disabled={counselorsLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={counselorsLoading ? "Loading counselors..." : "Select counselor"} />
                </SelectTrigger>
                <SelectContent>
                  {counselors.map((counselor) => (
                    <SelectItem key={counselor.id} value={counselor.id}>
                      {counselor.name} - {counselor.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-2">
              <Label className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Student</span>
              </Label>
              <Select
                value={selectedStudent}
                onValueChange={setSelectedStudent}
                disabled={studentsLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={studentsLoading ? "Loading students..." : "Select student"} />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Appointment Type */}
            <div className="space-y-2">
              <Label>Appointment Type</Label>
              <Select
                value={appointmentType}
                onValueChange={setAppointmentType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {appointmentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              {isLoading ? "Booking..." : "Book Appointment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
