import { useSocket } from '@/contexts/SocketContext';
import { cn } from '@/lib/utils';

export const OnlineStatusIndicator = ({ userId, className, showText = false, size = 'sm' }) => {
  const { isUserOnline } = useSocket();
  const isOnline = isUserOnline(userId);

  const sizeClasses = {
    xs: 'w-2 h-2',
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          'rounded-full border-2 border-white',
          sizeClasses[size],
          isOnline ? 'bg-green-500' : 'bg-gray-400'
        )}
        title={isOnline ? 'Online' : 'Offline'}
      />
      {showText && (
        <span className={cn(
          'text-sm font-medium',
          isOnline ? 'text-green-600' : 'text-gray-500'
        )}>
          {isOnline ? 'Online' : 'Offline'}
        </span>
      )}
    </div>
  );
};

export const OnlineStatusBadge = ({ userId, className }) => {
  const { isUserOnline } = useSocket();
  const isOnline = isUserOnline(userId);

  if (!isOnline) return null;

  return (
    <div className={cn(
      'absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white',
      className
    )} />
  );
};

export const OnlineUsersList = ({ users = [], className }) => {
  const { onlineUsers } = useSocket();

  const onlineUsersList = users.filter(user => onlineUsers.has(user.id));

  if (onlineUsersList.length === 0) {
    return (
      <div className={cn('text-sm text-gray-500 p-4', className)}>
        No users online
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      <h3 className="text-sm font-medium text-gray-700 mb-2">
        Online Users ({onlineUsersList.length})
      </h3>
      {onlineUsersList.map(user => (
        <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
          <div className="relative">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <OnlineStatusBadge userId={user.id} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.name}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user.role}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};