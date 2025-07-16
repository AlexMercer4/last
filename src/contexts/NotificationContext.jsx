import { createContext, useContext, useEffect, useState } from 'react';
import { useSocket } from './SocketContext';
import { useQueryClient } from '@tanstack/react-query';
import { notificationKeys } from '@/hooks/useNotifications';
import { toast } from 'sonner';

const NotificationContext = createContext(undefined);

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { socket, isConnected } = useSocket();
  const queryClient = useQueryClient();
  const [recentNotifications, setRecentNotifications] = useState([]);

  useEffect(() => {
    if (!socket || !isConnected) {
      console.log('🔔 NotificationProvider: Socket not ready', { socket: !!socket, isConnected });
      return;
    }

    console.log('🔔 NotificationProvider: Setting up notification listeners');

    // Handle real-time notifications
    const handleNotification = (notification) => {
      console.log('🔔 Received real-time notification:', notification);
      
      // Add to recent notifications for UI feedback
      setRecentNotifications(prev => [notification, ...prev.slice(0, 4)]);

      // Invalidate queries to refresh notification data
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount });

      // Show toast notification with enhanced styling
      const toastOptions = {
        duration: 5000,
        action: {
          label: 'View',
          onClick: () => {
            // Navigate to notifications page or relevant section
            window.location.href = '/notifications';
          },
        },
      };

      switch (notification.type) {
        case 'APPOINTMENT_BOOKED':
          toast.success(notification.title || 'New Appointment', {
            description: notification.message,
            ...toastOptions,
          });
          break;
        case 'APPOINTMENT_CANCELLED':
          toast.error(notification.title || 'Appointment Cancelled', {
            description: notification.message,
            ...toastOptions,
          });
          break;
        case 'APPOINTMENT_RESCHEDULED':
          toast.info(notification.title || 'Appointment Rescheduled', {
            description: notification.message,
            ...toastOptions,
          });
          break;
        case 'MESSAGE_RECEIVED':
          toast(notification.title || 'New Message', {
            description: notification.message,
            duration: 4000,
            action: {
              label: 'Reply',
              onClick: () => {
                window.location.href = '/messages';
              },
            },
          });
          break;
        case 'FILE_SHARED':
          toast.info(notification.title || 'File Shared', {
            description: notification.message,
            duration: 4000,
            action: {
              label: 'View',
              onClick: () => {
                window.location.href = '/messages';
              },
            },
          });
          break;
        case 'SYSTEM_NOTIFICATION':
          toast.warning(notification.title || 'System Notification', {
            description: notification.message,
            ...toastOptions,
          });
          break;
        default:
          toast(notification.title || 'Notification', {
            description: notification.message,
            ...toastOptions,
          });
      }
    };

    // Handle notification read status updates
    const handleNotificationRead = (data) => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount });
    };

    // Handle notification deletion
    const handleNotificationDeleted = (data) => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount });
    };

    socket.on('notification', handleNotification);
    socket.on('notification-read', handleNotificationRead);
    socket.on('notification-deleted', handleNotificationDeleted);

    return () => {
      socket.off('notification', handleNotification);
      socket.off('notification-read', handleNotificationRead);
      socket.off('notification-deleted', handleNotificationDeleted);
    };
  }, [socket, isConnected, queryClient]);

  // Clear recent notifications after some time
  useEffect(() => {
    if (recentNotifications.length > 0) {
      const timer = setTimeout(() => {
        setRecentNotifications([]);
      }, 30000); // Clear after 30 seconds

      return () => clearTimeout(timer);
    }
  }, [recentNotifications]);

  const value = {
    recentNotifications,
    clearRecentNotifications: () => setRecentNotifications([]),
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};