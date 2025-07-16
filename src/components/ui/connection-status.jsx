import { useSocket } from '@/contexts/SocketContext';
import { cn } from '@/lib/utils';
import { Wifi, WifiOff } from 'lucide-react';

export const ConnectionStatus = ({ className, showText = false }) => {
  const { isConnected } = useSocket();

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {isConnected ? (
        <>
          <Wifi className="w-4 h-4 text-green-500" />
          {showText && (
            <span className="text-sm text-green-600 font-medium">
              Connected
            </span>
          )}
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4 text-red-500" />
          {showText && (
            <span className="text-sm text-red-600 font-medium">
              Disconnected
            </span>
          )}
        </>
      )}
    </div>
  );
};

export const ConnectionStatusBadge = ({ className }) => {
  const { isConnected } = useSocket();

  return (
    <div
      className={cn(
        'w-2 h-2 rounded-full',
        isConnected ? 'bg-green-500' : 'bg-red-500',
        className
      )}
      title={isConnected ? 'Real-time connected' : 'Real-time disconnected'}
    />
  );
};