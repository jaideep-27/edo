import * as React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'cyan' | 'magenta' | 'amber' | 'success' | 'error' | 'purple';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-panel-elevated text-text-secondary border-border-glass',
    cyan: 'bg-neon-cyan-dim text-neon-cyan border-neon-cyan/20',
    magenta: 'bg-neon-magenta-dim text-neon-magenta border-neon-magenta/20',
    amber: 'bg-neon-amber-dim text-neon-amber border-neon-amber/20',
    success: 'bg-success/10 text-success border-success/20',
    error: 'bg-error/10 text-error border-error/20',
    purple: 'bg-brand-purple-dim text-brand-purple border-brand-purple/20',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
export type { BadgeProps };
