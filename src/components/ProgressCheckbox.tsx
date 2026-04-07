'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { toggleCompleted, getProgress } from '@/lib/storage';
import { cn } from '@/lib/utils';

interface ProgressCheckboxProps {
  slug: string;
}

export function ProgressCheckbox({ slug }: ProgressCheckboxProps) {
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const p = getProgress();
    setCompleted(p.completedLessons.includes(slug));
  }, [slug]);

  const handleToggle = () => {
    const updated = toggleCompleted(slug);
    setCompleted(updated.completedLessons.includes(slug));
  };

  return (
    <button
      onClick={handleToggle}
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
        'border focus:outline-none focus:ring-2 focus:ring-primary-500',
        completed
          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-emerald-300 dark:hover:border-emerald-700'
      )}
    >
      {completed ? (
        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
      ) : (
        <Circle className="w-4 h-4" />
      )}
      {completed ? 'Đã hoàn thành' : 'Đánh dấu hoàn thành'}
    </button>
  );
}
