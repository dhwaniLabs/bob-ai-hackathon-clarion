import React from 'react';
import { cn } from '../../lib/utils';

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div
    className={cn(
      'soc-card rounded-xl p-5 transition-all duration-200 relative overflow-hidden bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-sm hover:shadow',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div className={cn('flex items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-slate-800/80', className)} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className, children, ...props }) => (
  <h3 className={cn('text-sm font-bold tracking-wider text-slate-900 dark:text-slate-200 uppercase flex items-center gap-2', className)} {...props}>
    {children}
  </h3>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div className={cn('text-slate-600 dark:text-slate-300 text-sm', className)} {...props}>
    {children}
  </div>
);
