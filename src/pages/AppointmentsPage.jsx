import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import AppointmentCard from "@/components/appointments/AppointmentCard";
import BookAppointmentDialog from "@/components/appointments/BookAppointmentDialog";
import RescheduleAppointmentDialog from "@/components/appointments/RescheduleAppointmentDialog";
import AppointmentFilters from "@/components/appointments/AppointmentFilters";
import { useAuth } from "@/contexts/AuthContext";
import { useSocket } from "@/contexts/SocketContext";
import { useAppointments, useCreateAppointment, useUpdateAppointment, useCancelAppointment } from "@/hooks/useAppointments";
import { useQueryClient } from "@tanstack/react-query";
import { appointmentKeys } from "@/hooks/useAppointments";

export default function AppointmentsPage() {
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [filters, setFilters] = useState({});
  const { user } = useAuth();
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  const userRole = user?.role;

  // React Query hooks for real data
  const { data: appointmentsData, isLoading, error } = useAppointments(filters);
  
  // Ensure appointments is always an array
  const appointments = Array.isArray(appointmentsData) 
    ? appointmentsData 
    : appointmentsData?.appointments || appointmentsData?.data || [];
  const createAppointmentMutation = useCreateAppointment();
  const updateAppointmentMutation = useUpdateAppointment();
  const cancelAppointmentMutation = useCancelAppointment();

  // Set up real-time Socket.io listeners for appointment updates
  useEffect(() => {
    if (!socket) return;

    const handleAppointmentUpdate = (data) => {
      // Invalidate appointments query to refetch data
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });

      // Show appropriate toast notification
      switch (data.type) {
        case 'APPOINTMENT_BOOKED':
          toast.success('New Appointment Booked', {
            description: data.message,
          });
          break;
        case 'APPOINTMENT_CANCELLED':
          toast.info('Appointment Cancelled', {
            description: data.message,
          });
          break;
        case 'APPOINTMENT_RESCHEDULED':
          toast.info('Appointment Rescheduled', {
            description: data.message,
          });
          break;
        default:
          break;
      }
    };

    // Listen for appointment-related events
    socket.on('appointment-update', handleAppointmentUpdate);
    socket.on('notification', (notification) => {
      if (notification.type.startsWith('APPOINTMENT_')) {
        queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      }
    });

    return () => {
      socket.off('appointment-update', handleAppointmentUpdate);
      socket.off('notification');
    };
  }, [socket, queryClient]);

  const handleBookAppointment = async (appointmentData) => {
    try {
      await createAppointmentMutation.mutateAsync(appointmentData);
      setIsBookingDialogOpen(false);
    } catch (error) {
      // Error handling is done in the mutation hook
      console.error('Failed to book appointment:', error);
    }
  };

  const handleReschedule = async (appointment) => {
    setSelectedAppointment(appointment);
    setIsRescheduleDialogOpen(true);
  };

  const handleRescheduleSubmit = async (appointmentId, updateData) => {
    try {
      await updateAppointmentMutation.mutateAsync({
        id: appointmentId,
        appointmentData: updateData
      });
      setIsRescheduleDialogOpen(false);
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Failed to reschedule appointment:', error);
    }
  };

  const handleCancel = async (appointment) => {
    try {
      await cancelAppointmentMutation.mutateAsync(appointment.id);
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
    }
  };

  const handleComplete = async (appointment) => {
    try {
      await updateAppointmentMutation.mutateAsync({
        id: appointment.id,
        appointmentData: { status: 'COMPLETED' }
      });
    } catch (error) {
      console.error('Failed to complete appointment:', error);
    }
  };

  const canBookAppointment = userRole === "student" || userRole === "counselor";

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0056b3]"></div>
            <span className="ml-2 text-gray-600">Loading appointments...</span>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-red-600 text-lg">Failed to load appointments</p>
            <p className="text-gray-500 mt-2">{error.message}</p>
            <Button
              onClick={() => queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() })}
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        </main>
      </div>
    );
  }

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

        {/* Single Appointments View - No Tabs */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              All Appointments ({appointments.length})
            </h2>
          </div>

          {appointments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {Object.keys(filters).length > 0
                  ? "No appointments found matching your filters."
                  : "No appointments found."
                }
              </p>
              {canBookAppointment && Object.keys(filters).length === 0 && (
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
              {appointments.map((appointment) => (
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
        </div>

        {/* Book Appointment Dialog */}
        <BookAppointmentDialog
          open={isBookingDialogOpen}
          onOpenChange={setIsBookingDialogOpen}
          userRole={userRole}
          onSubmit={handleBookAppointment}
        />

        {/* Reschedule Appointment Dialog */}
        <RescheduleAppointmentDialog
          open={isRescheduleDialogOpen}
          onOpenChange={setIsRescheduleDialogOpen}
          appointment={selectedAppointment}
          onSubmit={handleRescheduleSubmit}
        />
      </main>
    </div>
  );
}
