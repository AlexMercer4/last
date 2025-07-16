import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useUnreadNotificationCount } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';

export default function NotificationIndicator({ className, showBell = true, size = 'default' }) {
  const { data: unreadCount, isLoading, error } = useUnreadNotificationCount();
  const hasUnread = unreadCount?.count > 0;



  const sizeClasses = {
    sm: 'h-4 w-4',
    default: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      {showBell && (
        <Bell className={cn(sizeClasses[size], 'text-current')} />
      )}
      {hasUnread && (
        <span 
          className={cn(
            'absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1',
            'border-2 border-white shadow-sm'
          )}
        >
          {unreadCount.count > 99 ? '99+' : unreadCount.count}
        </span>
      )}
    </div>
  );
}