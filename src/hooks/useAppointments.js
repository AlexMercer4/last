import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { appointmentsApi } from '@/api/appointments';
import { toast } from 'sonner';

// Query keys
export const appointmentKeys = {
  all: ['appointments'],
  lists: () => [...appointmentKeys.all, 'list'],
  list: (filters) => [...appointmentKeys.lists(), { filters }],
  details: () => [...appointmentKeys.all, 'detail'],
  detail: (id) => [...appointmentKeys.details(), id],
  availability: (counselorId, date) => ['appointments', 'availability', counselorId, date],
};

// Get appointments with filters
export const useAppointments = (filters = {}) => {
  return useQuery({
    queryKey: appointmentKeys.list(filters),
    queryFn: () => appointmentsApi.getAppointments(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Get appointment by ID
export const useAppointment = (id) => {
  return useQuery({
    queryKey: appointmentKeys.detail(id),
    queryFn: () => appointmentsApi.getAppointmentById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Get counselor availability
export const useCounselorAvailability = (counselorId, date) => {
  return useQuery({
    queryKey: appointmentKeys.availability(counselorId, date),
    queryFn: () => appointmentsApi.getCounselorAvailability(counselorId, date),
    enabled: !!counselorId,
    staleTime: 1000 * 60 * 1, // 1 minute (availability changes frequently)
  });
};

// Create appointment mutation
export const useCreateAppointment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: appointmentsApi.createAppointment,
    onSuccess: (newAppointment) => {
      // Invalidate appointments lists
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      
      // Invalidate availability for the counselor
      queryClient.invalidateQueries({ 
        queryKey: ['appointments', 'availability', newAppointment.counselorId] 
      });
      
      toast.success('Appointment booked successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.error?.message || 'Failed to book appointment';
      toast.error(message);
    },
  });
};

// Update appointment mutation
export const useUpdateAppointment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, appointmentData }) => appointmentsApi.updateAppointment(id, appointmentData),
    onMutate: async ({ id, appointmentData }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: appointmentKeys.detail(id) });
      
      // Snapshot previous value
      const previousAppointment = queryClient.getQueryData(appointmentKeys.detail(id));
      
      // Optimistically update
      queryClient.setQueryData(appointmentKeys.detail(id), (old) => ({
        ...old,
        ...appointmentData,
      }));
      
      return { previousAppointment, id };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousAppointment) {
        queryClient.setQueryData(appointmentKeys.detail(context.id), context.previousAppointment);
      }
      
      const message = error.response?.data?.error?.message || 'Failed to update appointment';
      toast.error(message);
    },
    onSuccess: (updatedAppointment, { id }) => {
      // Update cache with server response
      queryClient.setQueryData(appointmentKeys.detail(id), updatedAppointment);
      
      // Invalidate lists and availability
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      queryClient.invalidateQueries({ 
        queryKey: ['appointments', 'availability', updatedAppointment.counselorId] 
      });
      
      toast.success('Appointment updated successfully');
    },
    onSettled: (data, error, { id }) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: appointmentKeys.detail(id) });
    },
  });
};

// Cancel appointment mutation
export const useCancelAppointment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: appointmentsApi.cancelAppointment,
    onMutate: async (appointmentId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: appointmentKeys.detail(appointmentId) });
      
      // Snapshot previous value
      const previousAppointment = queryClient.getQueryData(appointmentKeys.detail(appointmentId));
      
      // Optimistically update status
      queryClient.setQueryData(appointmentKeys.detail(appointmentId), (old) => ({
        ...old,
        status: 'CANCELLED',
      }));
      
      return { previousAppointment, appointmentId };
    },
    onError: (error, appointmentId, context) => {
      // Rollback on error
      if (context?.previousAppointment) {
        queryClient.setQueryData(appointmentKeys.detail(context.appointmentId), context.previousAppointment);
      }
      
      const message = error.response?.data?.error?.message || 'Failed to cancel appointment';
      toast.error(message);
    },
    onSuccess: (data, appointmentId) => {
      // Invalidate lists and availability
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      
      // Get appointment data to invalidate counselor availability
      const appointment = queryClient.getQueryData(appointmentKeys.detail(appointmentId));
      if (appointment?.counselorId) {
        queryClient.invalidateQueries({ 
          queryKey: ['appointments', 'availability', appointment.counselorId] 
        });
      }
      
      toast.success('Appointment cancelled successfully');
    },
    onSettled: (data, error, appointmentId) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: appointmentKeys.detail(appointmentId) });
    },
  });
};