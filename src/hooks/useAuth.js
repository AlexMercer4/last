import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/api/auth';
import { toast } from 'sonner';

// Query keys
export const authKeys = {
  currentUser: ['auth', 'currentUser'],
};

// Get current user
export const useCurrentUser = () => {
  return useQuery({
    queryKey: authKeys.currentUser,
    queryFn: authApi.getCurrentUser,
    retry: false,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Login mutation
export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      // Store token and user data
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Update current user cache
      queryClient.setQueryData(authKeys.currentUser, data.user);
      
      toast.success('Login successful');
    },
    onError: (error) => {
      const message = error.response?.data?.error?.message || 'Login failed';
      toast.error(message);
    },
  });
};

// Logout mutation
export const useLogout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // Clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      // Clear all queries
      queryClient.clear();
      
      toast.success('Logged out successfully');
    },
    onError: (error) => {
      // Even if logout fails on server, clear local data
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      queryClient.clear();
      
      const message = error.response?.data?.error?.message || 'Logout completed';
      toast.info(message);
    },
  });
};