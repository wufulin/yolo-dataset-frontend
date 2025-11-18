'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface LoadingProps {
  size?: 'sm' | 'default' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars';
  text?: string;
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({
  size = 'default',
  variant = 'spinner',
  text,
  className,
}) => {
  const sizes = {
    sm: 'h-4 w-4',
    default: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  const variants = {
    spinner: (
      <svg
        className={cn('animate-spin', sizes[size])}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    ),
    dots: (
      <div className="flex space-x-1">
        <div
          className={cn(
            'rounded-full bg-current animate-bounce',
            size === 'sm' ? 'h-1 w-1' : size === 'lg' ? 'h-3 w-3' : 'h-2 w-2'
          )}
          style={{ animationDelay: '0ms' }}
        />
        <div
          className={cn(
            'rounded-full bg-current animate-bounce',
            size === 'sm' ? 'h-1 w-1' : size === 'lg' ? 'h-3 w-3' : 'h-2 w-2'
          )}
          style={{ animationDelay: '150ms' }}
        />
        <div
          className={cn(
            'rounded-full bg-current animate-bounce',
            size === 'sm' ? 'h-1 w-1' : size === 'lg' ? 'h-3 w-3' : 'h-2 w-2'
          )}
          style={{ animationDelay: '300ms' }}
        />
      </div>
    ),
    pulse: (
      <div
        className={cn(
          'rounded-full bg-current animate-pulse',
          size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-8 w-8' : 'h-6 w-6'
        )}
      />
    ),
    bars: (
      <div className="flex items-end space-x-1">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              'bg-current animate-pulse',
              size === 'sm' ? 'h-4 w-1' : size === 'lg' ? 'h-8 w-2' : 'h-6 w-1.5'
            )}
            style={{
              height: `${30 + (i * 10)}%`,
              animationDelay: `${i * 100}ms`,
            }}
          />
        ))}
      </div>
    ),
  };

  return (
    <div className={cn('flex flex-col items-center justify-center space-y-2', className)}>
      {variants[variant]}
      {text && (
        <p className="text-sm text-muted-foreground">{text}</p>
      )}
    </div>
  );
};

export default Loading;