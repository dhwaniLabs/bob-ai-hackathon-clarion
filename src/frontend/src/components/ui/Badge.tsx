import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'critical' | 'high' | 'medium' | 'low' | 'cyan' | 'safe' | 'outline';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  size = 'sm',
  children,
  ...props
}) => {
  const variantClasses = {
    default: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    critical: 'bg-rose-50 text-rose-700 border-rose-200 shadow-sm shadow-rose-100 dark:bg-red-950/80 dark:text-red-400 dark:border-red-500/60 dark:shadow-red-950',
    high: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/80 dark:text-amber-400 dark:border-amber-500/60',
    medium: 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-950/80 dark:text-yellow-400 dark:border-yellow-500/60',
    low: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/80 dark:text-blue-400 dark:border-blue-500/60',
    cyan: 'bg-sky-50 text-sky-700 border-sky-200 shadow-sm shadow-sky-100 dark:bg-cyan-950/80 dark:text-cyan-300 dark:border-cyan-500/60 dark:shadow-cyan-950',
    safe: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-400 dark:border-emerald-500/60',
    outline: 'bg-white text-slate-700 border-slate-200 dark:bg-transparent dark:text-slate-300 dark:border-slate-700',
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 rounded font-medium',
    md: 'text-xs px-2.5 py-1 rounded-md font-semibold',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 border font-mono tracking-wide transition-colors',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
