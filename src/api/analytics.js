import axiosInstance from '@/lib/axiosInstance';

export const analyticsApi = {
  // Get dashboard statistics
  getDashboardStats: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    
    const response = await axiosInstance.get(`/analytics/dashboard?${params.toString()}`);
    return response.data;
  },

  // Get appointment analytics
  getAppointmentAnalytics: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    
    const response = await axiosInstance.get(`/analytics/appointments?${params.toString()}`);
    return response.data;
  },

  // Get student engagement metrics
  getStudentAnalytics: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    
    const response = await axiosInstance.get(`/analytics/students?${params.toString()}`);
    return response.data;
  },

  // Get counselor performance metrics
  getCounselorAnalytics: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    
    const response = await axiosInstance.get(`/analytics/counselors?${params.toString()}`);
    return response.data;
  },
};