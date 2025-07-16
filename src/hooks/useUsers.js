import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/api/users';
import { toast } from 'sonner';

// Query keys
export const userKeys = {
  all: ['users'],
  lists: () => [...userKeys.all, 'list'],
  list: (filters) => [...userKeys.lists(), { filters }],
  details: () => [...userKeys.all, 'detail'],
  detail: (id) => [...userKeys.details(), id],
  students: ['users', 'students'],
  counselors: ['users', 'counselors'],
};

// Get all users
export const useUsers = (filters = {}) => {
  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: () => usersApi.getAllUsers(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Get user by ID
export const useUser = (id) => {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => usersApi.getUserById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Get students
export const useStudents = () => {
  return useQuery({
    queryKey: userKeys.students,
    queryFn: usersApi.getStudents,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Get counselors
export const useCounselors = () => {
  return useQuery({
    queryKey: userKeys.counselors,
    queryFn: usersApi.getCounselors,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Create user mutation
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: usersApi.createUser,
    onSuccess: (newUser) => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      
      // Add to specific lists based on role
      if (newUser.role === 'STUDENT') {
        queryClient.invalidateQueries({ queryKey: userKeys.students });
      } else if (newUser.role === 'COUNSELOR') {
        queryClient.invalidateQueries({ queryKey: userKeys.counselors });
      }
      
      toast.success('User created successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.error?.message || 'Failed to create user';
      toast.error(message);
    },
  });
};

// Update user mutation
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, userData }) => usersApi.updateUser(id, userData),
    onMutate: async ({ id, userData }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: userKeys.detail(id) });
      
      // Snapshot previous value
      const previousUser = queryClient.getQueryData(userKeys.detail(id));
      
      // Optimistically update
      queryClient.setQueryData(userKeys.detail(id), (old) => ({
        ...old,
        ...userData,
      }));
      
      return { previousUser, id };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousUser) {
        queryClient.setQueryData(userKeys.detail(context.id), context.previousUser);
      }
      
      const message = error.response?.data?.error?.message || 'Failed to update user';
      toast.error(message);
    },
    onSuccess: (updatedUser, { id }) => {
      // Update cache with server response
      queryClient.setQueryData(userKeys.detail(id), updatedUser);
      
      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.students });
      queryClient.invalidateQueries({ queryKey: userKeys.counselors });
      
      toast.success('User updated successfully');
    },
    onSettled: (data, error, { id }) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
    },
  });
};

// Delete user mutation
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: usersApi.deleteUser,
    onSuccess: (data, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: userKeys.detail(deletedId) });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.students });
      queryClient.invalidateQueries({ queryKey: userKeys.counselors });
      
      toast.success('User deleted successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.error?.message || 'Failed to delete user';
      toast.error(message);
    },
  });
};

// Change password mutation
export const useChangePassword = () => {
  return useMutation({
    mutationFn: usersApi.changePassword,
    onSuccess: () => {
      toast.success('Password changed successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.error?.message || 'Failed to change password';
      toast.error(message);
    },
  });
};