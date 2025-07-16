import axiosInstance from '@/lib/axiosInstance';

export const appointmentsApi = {
  // Get appointments with filters
  getAppointments: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    
    const response = await axiosInstance.get(`/appointments?${params.toString()}`);
    return response.data;
  },

  // Create appointment
  createAppointment: async (appointmentData) => {
    const response = await axiosInstance.post('/appointments', appointmentData);
    return response.data;
  },

  // Get appointment by ID
  getAppointmentById: async (id) => {
    const response = await axiosInstance.get(`/appointments/${id}`);
    return response.data;
  },

  // Update appointment
  updateAppointment: async (id, appointmentData) => {
    const response = await axiosInstance.put(`/appointments/${id}`, appointmentData);
    return response.data;
  },

  // Cancel appointment
  cancelAppointment: async (id) => {
    const response = await axiosInstance.delete(`/appointments/${id}`);
    return response.data;
  },

  // Get counselor availability
  getCounselorAvailability: async (counselorId, date) => {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    
    const response = await axiosInstance.get(`/appointments/availability/${counselorId}?${params.toString()}`);
    return response.data;
  },
};