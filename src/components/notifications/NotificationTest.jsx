import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSocket } from '@/contexts/SocketContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications, useUnreadNotificationCount } from '@/hooks/useNotifications';
import { toast } from 'sonner';
import axios from 'axios';

export default function NotificationTest() {
  const { socket, isConnected } = useSocket();
  const { user } = useAuth();
  const { data: notifications, refetch: refetchNotifications } = useNotifications();
  const { data: unreadCount, refetch: refetchUnreadCount } = useUnreadNotificationCount();
  const [testUserId, setTestUserId] = useState('');

  const createTestNotification = async (type) => {
    const testNotifications = {
      message: {
        type: 'MESSAGE_RECEIVED',
        title: 'New Message',
        message: 'You have received a test message from your counselor',
      },
      appointment: {
        type: 'APPOINTMENT_BOOKED',
        title: 'Appointment Scheduled',
        message: 'Your appointment has been scheduled for tomorrow at 2:00 PM',
      },
    };

    const notification = testNotifications[type];
    if (!notification) return;

    try {
      const response = await axios.post('/api/notifications', {
        userId: testUserId || user.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        data: { test: true }
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.data.success) {
        toast.success(`Test ${type} notification created!`);
        refetchNotifications();
        refetchUnreadCount();
      } else {
        toast.error('Failed to create notification');
      }
    } catch (error) {
      console.error('Error creating test notification:', error);
      toast.error('Failed to create notification: ' + (error.response?.data?.error?.message || error.message));
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>🔧 Notification Test</CardTitle>
        <div className="text-sm space-y-1">
          <p>Socket: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}</p>
          <p>User: {user?.id}</p>
          <p>Unread: {unreadCount?.count || 0}</p>
          <p>Total: {notifications?.notifications?.length || 0}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="testUserId">Target User ID (optional)</Label>
          <Input
            id="testUserId"
            value={testUserId}
            onChange={(e) => setTestUserId(e.target.value)}
            placeholder="Leave empty for self"
          />
        </div>
        
        <div className="space-y-2">
          <Button
            onClick={() => createTestNotification('message')}
            className="w-full"
            variant="outline"
          >
            💬 Test Message Notification
          </Button>
          <Button
            onClick={() => createTestNotification('appointment')}
            className="w-full"
            variant="outline"
          >
            📅 Test Appointment Notification
          </Button>
        </div>

        <div className="space-y-2">
          <Button
            onClick={() => {
              refetchNotifications();
              refetchUnreadCount();
              toast.success('Data refreshed');
            }}
            className="w-full"
            variant="secondary"
          >
            🔄 Refresh Data
          </Button>
          <Button
            onClick={() => {
              console.log('=== NOTIFICATION DEBUG INFO ===');
              console.log('Socket:', socket);
              console.log('Connected:', isConnected);
              console.log('User:', user);
              console.log('Notifications:', notifications);
              console.log('Unread Count:', unreadCount);
              console.log('================================');
              toast.success('Debug info logged to console');
            }}
            className="w-full"
            variant="secondary"
          >
            🐛 Log Debug Info
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}