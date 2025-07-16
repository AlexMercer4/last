import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export const TypingIndicator = ({ typingUsers = [] }) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (typingUsers.length === 0) return;

    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, [typingUsers.length]);

  if (typingUsers.length === 0) return null;

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0].userName} is typing`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0].userName} and ${typingUsers[1].userName} are typing`;
    } else {
      return `${typingUsers[0].userName} and ${typingUsers.length - 1} others are typing`;
    }
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500">
      <div className="flex gap-1">
        <div className={cn(
          'w-2 h-2 bg-gray-400 rounded-full animate-bounce',
          '[animation-delay:-0.3s]'
        )} />
        <div className={cn(
          'w-2 h-2 bg-gray-400 rounded-full animate-bounce',
          '[animation-delay:-0.15s]'
        )} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
      </div>
      <span>{getTypingText()}{dots}</span>
    </div>
  );
};

export default TypingIndicator;