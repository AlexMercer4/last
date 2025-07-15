import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import AppointmentCard from "@/components/appointments/AppointmentCard";
import BookAppointmentDialog from "@/components/appointments/BookAppointmentDialog";
import AppointmentFilters from "@/components/appointments/AppointmentFilters";
import { useAuth } from "@/contexts/AuthContext";

export default function AppointmentsPage() {
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const [activeTab, setActiveTab] = useState("all");
  const { user } = useAuth();
  const userRole = user?.role;

  // Mock appointments data - replace with actual API calls
  const [appointments, setAppointments] = useState([
    {
      id: "1",
      date: "2024-06-25",
      time: "10:00 AM",
      counselor: "Dr. Sarah Ahmed",
      student: "Ahmad Ali",
      location: "Room 201, Counseling Center",
      status: "scheduled",
      type: "counseling",
      notes: "Follow-up session for academic planning",
      createdAt: "2024-06-20T10:00:00Z",
      updatedAt: "2024-06-20T10:00:00Z",
    },
    {
      id: "2",
      date: "2024-06-28",
      time: "2:00 PM",
      counselor: "Prof. Ahmad Hassan",
      student: "Ahmad Ali",
      location: "Room 105, Student Services",
      status: "pending",
      type: "academic",
      notes: "Course selection guidance",
      createdAt: "2024-06-21T14:00:00Z",
      updatedAt: "2024-06-21T14:00:00Z",
    },
    {
      id: "3",
      date: "2024-06-20",
      time: "11:00 AM",
      counselor: "Dr. Fatima Sheikh",
      student: "Ahmad Ali",
      location: "Room 303, Academic Block",
      status: "completed",
      type: "career",
      notes: "Career path discussion",
      createdAt: "2024-06-15T11:00:00Z",
      updatedAt: "2024-06-20T11:30:00Z",
    },
    {
      id: "4",
      date: "2024-06-15",
      time: "3:00 PM",
      counselor: "Prof. Ali Khan",
      student: "Ahmad Ali",
      location: "Room 202, Counseling Center",
      status: "cancelled",
      type: "personal",
      notes: "Personal development session",
      createdAt: "2024-06-10T15:00:00Z",
      updatedAt: "2024-06-14T10:00:00Z",
    },
  ]);

  const handleBookAppointment = async (appointmentData) => {
    try {
      // Simulate API call
      const newAppointment = {
        id: Date.now().toString(),
        ...appointmentData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setAppointments((prev) => [newAppointment, ...prev]);
      toast.success("Appointment booked successfully!");
    } catch (error) {
      console.log(error);

      toast.error("Failed to book appointment. Please try again.");
    }
  };

  const handleReschedule = (appointment) => {
    console.log(appointment);
    // Open reschedule dialog (similar to booking dialog)
    toast.info("Reschedule functionality would open here");
  };

  const handleCancel = (appointment) => {
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === appointment.id
          ? { ...apt, status: "cancelled", updatedAt: new Date().toISOString() }
          : apt
      )
    );
    toast.success("Appointment cancelled successfully");
  };

  const handleComplete = (appointment) => {
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === appointment.id
          ? { ...apt, status: "completed", updatedAt: new Date().toISOString() }
          : apt
      )
    );
    toast.success("Appointment marked as completed");
  };

  const filterAppointments = (appointments, tab) => {
    let filtered = appointments;

    // Filter by tab
    if (tab === "upcoming") {
      filtered = filtered.filter(
        (apt) => apt.status === "scheduled" || apt.status === "pending"
      );
    } else if (tab === "past") {
      filtered = filtered.filter(
        (apt) => apt.status === "completed" || apt.status === "cancelled"
      );
    }

    // Apply additional filters
    if (filters.status) {
      filtered = filtered.filter((apt) => apt.status === filters.status);
    }
    if (filters.type) {
      filtered = filtered.filter((apt) => apt.type === filters.type);
    }
    if (filters.counselor) {
      filtered = filtered.filter((apt) =>
        apt.counselor.includes(filters.counselor)
      );
    }
    if (filters.dateRange) {
      const { start, end } = filters.dateRange;
      if (start) {
        filtered = filtered.filter((apt) => apt.date >= start);
      }
      if (end) {
        filtered = filtered.filter((apt) => apt.date <= end);
      }
    }

    return filtered;
  };

  const upcomingAppointments = filterAppointments(appointments, "upcoming");
  const pastAppointments = filterAppointments(appointments, "past");
  const allAppointments = filterAppointments(appointments, "all");

  const canBookAppointment = userRole === "student" || userRole === "counselor";

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
            <p className="text-gray-600 mt-2">
              Manage your counseling sessions and schedule.
            </p>
          </div>

          {canBookAppointment && (
            <Button
              onClick={() => setIsBookingDialogOpen(true)}
              className="mt-4 sm:mt-0 bg-[#0056b3] hover:bg-[#004494] flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Book Appointment</span>
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="mb-6">
          <AppointmentFilters
            filters={filters}
            onFiltersChange={setFilters}
            userRole={userRole}
          />
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
            <TabsTrigger value="upcoming">Upcoming Appointments</TabsTrigger>
            <TabsTrigger value="past">Past Appointments</TabsTrigger>
            <TabsTrigger value="all">All Appointments</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Upcoming Appointments ({upcomingAppointments.length})
              </h2>
            </div>

            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  No upcoming appointments found.
                </p>
                {canBookAppointment && (
                  <Button
                    onClick={() => setIsBookingDialogOpen(true)}
                    className="mt-4 bg-[#0056b3] hover:bg-[#004494]"
                  >
                    Book Your First Appointment
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {upcomingAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    userRole={userRole}
                    onReschedule={handleReschedule}
                    onCancel={handleCancel}
                    onComplete={handleComplete}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Past Appointments ({pastAppointments.length})
              </h2>
            </div>

            {pastAppointments.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  No past appointments found.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {pastAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    userRole={userRole}
                    onReschedule={handleReschedule}
                    onCancel={handleCancel}
                    onComplete={handleComplete}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                All Appointments ({allAppointments.length})
              </h2>
            </div>

            {allAppointments.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No appointments found.</p>
                {canBookAppointment && (
                  <Button
                    onClick={() => setIsBookingDialogOpen(true)}
                    className="mt-4 bg-[#0056b3] hover:bg-[#004494]"
                  >
                    Book Your First Appointment
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {allAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    userRole={userRole}
                    onReschedule={handleReschedule}
                    onCancel={handleCancel}
                    onComplete={handleComplete}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Book Appointment Dialog */}
        <BookAppointmentDialog
          open={isBookingDialogOpen}
          onOpenChange={setIsBookingDialogOpen}
          userRole={userRole}
          onSubmit={handleBookAppointment}
        />
      </main>
    </div>
  );
}
