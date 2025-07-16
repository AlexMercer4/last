import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/api/notifications';
import { toast } from 'sonner';

// Query keys
export const notificationKeys = {
  all: ['notifications'],
  lists: () => [...notificationKeys.all, 'list'],
  list: (filters) => [...notificationKeys.lists(), { filters }],
  unreadCount: ['notifications', 'unreadCount'],
};

// Get notifications
export const useNotifications = (filters = {}) => {
  return useQuery({
    queryKey: notificationKeys.list(filters),
    queryFn: () => notificationsApi.getNotifications(filters),
    staleTime: 1000 * 60 * 1, // 1 minute
    select: (data) => {
      // Handle both old and new API response formats
      if (data.notifications) {
        return data; // New format
      } else if (data.data?.notifications) {
        return data.data; // Old format
      }
      return data;
    }
  });
};

// Get unread notification count
export const useUnreadNotificationCount = () => {
  return useQuery({
    queryKey: notificationKeys.unreadCount,
    queryFn: notificationsApi.getUnreadCount,
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Refetch every minute
  });
};

// Mark notification as read mutation
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: notificationsApi.markNotificationAsRead,
    onMutate: async (notificationId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: notificationKeys.lists() });
      
      // Snapshot previous values
      const previousNotifications = queryClient.getQueriesData({ 
        queryKey: notificationKeys.lists() 
      });
      
      // Optimistically update notification as read
      queryClient.setQueriesData(
        { queryKey: notificationKeys.lists() },
        (old) => {
          if (!old || !old.notifications || !Array.isArray(old.notifications)) return old;
          return {
            ...old,
            notifications: old.notifications.map(notification => 
              notification.id === notificationId 
                ? { ...notification, isRead: true }
                : notification
            )
          };
        }
      );
      
      // Update unread count
      queryClient.setQueryData(notificationKeys.unreadCount, (old) => {
        if (!old || old.count <= 0) return old;
        return { ...old, count: old.count - 1 };
      });
      
      return { previousNotifications, notificationId };
    },
    onError: (error, notificationId, context) => {
      // Rollback optimistic updates
      if (context?.previousNotifications) {
        context.previousNotifications.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      
      // Refetch unread count
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount });
      
      console.error('Failed to mark notification as read:', error);
    },
    onSuccess: () => {
      // Success is handled by optimistic update
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount });
    },
  });
};

// Mark all notifications as read mutation
export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: notificationsApi.markAllNotificationsAsRead,
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: notificationKeys.lists() });
      
      // Snapshot previous values
      const previousNotifications = queryClient.getQueriesData({ 
        queryKey: notificationKeys.lists() 
      });
      
      // Optimistically mark all as read
      queryClient.setQueriesData(
        { queryKey: notificationKeys.lists() },
        (old) => {
          if (!old || !old.notifications || !Array.isArray(old.notifications)) return old;
          return {
            ...old,
            notifications: old.notifications.map(notification => ({ ...notification, isRead: true }))
          };
        }
      );
      
      // Update unread count to 0
      queryClient.setQueryData(notificationKeys.unreadCount, { count: 0 });
      
      return { previousNotifications };
    },
    onError: (error, variables, context) => {
      // Rollback optimistic updates
      if (context?.previousNotifications) {
        context.previousNotifications.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      
      // Refetch unread count
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount });
      
      const message = error.response?.data?.error?.message || 'Failed to mark all notifications as read';
      toast.error(message);
    },
    onSuccess: () => {
      toast.success('All notifications marked as read');
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount });
    },
  });
};

// Delete notification mutation
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: notificationsApi.deleteNotification,
    onMutate: async (notificationId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: notificationKeys.lists() });
      
      // Get notification data for rollback
      const previousNotifications = queryClient.getQueriesData({ 
        queryKey: notificationKeys.lists() 
      });
      
      let wasUnread = false;
      
      // Optimistically remove notification
      queryClient.setQueriesData(
        { queryKey: notificationKeys.lists() },
        (old) => {
          if (!old || !old.notifications || !Array.isArray(old.notifications)) return old;
          
          const notification = old.notifications.find(n => n.id === notificationId);
          if (notification && !notification.isRead) {
            wasUnread = true;
          }
          
          return {
            ...old,
            notifications: old.notifications.filter(notification => notification.id !== notificationId)
          };
        }
      );
      
      // Update unread count if notification was unread
      if (wasUnread) {
        queryClient.setQueryData(notificationKeys.unreadCount, (old) => {
          if (!old || old.count <= 0) return old;
          return { ...old, count: old.count - 1 };
        });
      }
      
      return { previousNotifications, notificationId, wasUnread };
    },
    onError: (error, notificationId, context) => {
      // Rollback optimistic updates
      if (context?.previousNotifications) {
        context.previousNotifications.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      
      // Refetch unread count
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount });
      
      const message = error.response?.data?.error?.message || 'Failed to delete notification';
      toast.error(message);
    },
    onSuccess: () => {
      toast.success('Notification deleted');
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount });
    },
  });
};