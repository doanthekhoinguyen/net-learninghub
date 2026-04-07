'use client';

import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showPercent?: boolean;
  showShimmer?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: { bar: 'h-1.5', text: 'text-xs', container: 'gap-1' },
  md: { bar: 'h-2.5', text: 'text-sm', container: 'gap-2' },
  lg: { bar: 'h-4', text: 'text-base', container: 'gap-3' },
};

export function ProgressBar({ value, label, size = 'md', showPercent = true, showShimmer = true, className }: ProgressBarProps) {
  const cfg = sizeConfig[size];
  const clamped = Math.min(100, Math.max(0, value));
  const isComplete = clamped >= 100;

  return (
    <div className={cn('flex flex-col', className)}>
      {(label || showPercent) && (
        <div className={cn('flex items-center justify-between', cfg.container)}>
          {label && <span className={cn('font-medium text-slate-700 dark:text-slate-300', cfg.text)}>{label}</span>}
          {showPercent && (
            <span className={cn('font-bold tabular-nums', cfg.text,
              isComplete ? 'text-emerald-600 dark:text-emerald-400' : 'text-primary-600 dark:text-primary-400'
            )}>
              {clamped}%
            </span>
          )}
        </div>
      )}
      <div className={cn('w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden', cfg.bar)}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden',
            isComplete
              ? 'bg-gradient-to-r from-emerald-400 to-emerald-500 dark:from-emerald-400 dark:to-emerald-500'
              : clamped >= 60
              ? 'bg-gradient-to-r from-primary-500 to-blue-500 dark:from-primary-400 dark:to-blue-400'
              : 'bg-primary-500 dark:bg-primary-400'
          )}
          style={{ width: `${clamped}%` }}
        >
          {showShimmer && clamped > 0 && clamped < 100 && (
            <div className="absolute inset-0 progress-shimmer" />
          )}
        </div>
      </div>
    </div>
  );
}
