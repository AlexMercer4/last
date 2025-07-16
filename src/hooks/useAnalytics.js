import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/api/analytics';

// Hook for dashboard statistics
export const useDashboardStats = (filters = {}) => {
  return useQuery({
    queryKey: ['analytics', 'dashboard', filters],
    queryFn: () => analyticsApi.getDashboardStats(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for appointment analytics
export const useAppointmentAnalytics = (filters = {}) => {
  return useQuery({
    queryKey: ['analytics', 'appointments', filters],
    queryFn: () => analyticsApi.getAppointmentAnalytics(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for student analytics
export const useStudentAnalytics = (filters = {}) => {
  return useQuery({
    queryKey: ['analytics', 'students', filters],
    queryFn: () => analyticsApi.getStudentAnalytics(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for counselor analytics
export const useCounselorAnalytics = (filters = {}) => {
  return useQuery({
    queryKey: ['analytics', 'counselors', filters],
    queryFn: () => analyticsApi.getCounselorAnalytics(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};