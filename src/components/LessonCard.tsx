'use client';

import Link from 'next/link';
import { CheckCircle2, Bookmark, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LessonMeta } from '@/types';

interface LessonCardProps {
  lesson: LessonMeta;
  isActive?: boolean;
  isCompleted?: boolean;
  isBookmarked?: boolean;
  readingTime?: number;
}

export function LessonCard({ lesson, isActive, isCompleted, isBookmarked, readingTime }: LessonCardProps) {
  const isInProgress = !isCompleted;

  return (
    <Link
      href={`/lesson/${lesson.slug.replace(/\//g, '/')}`}
      className={cn(
        'group flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-150',
        'hover:bg-slate-100 dark:hover:bg-slate-800',
        'focus:outline-none focus:ring-2 focus:ring-primary-500',
        isActive
          ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium border-l-2 border-primary-500 pl-[10px]'
          : 'text-slate-700 dark:text-slate-300',
      )}
    >
      {/* Status icon */}
      <span className="shrink-0 transition-transform duration-150 group-hover:translate-x-0.5">
        {isCompleted ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
        ) : (
          <Circle className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-primary-400 transition-colors" />
        )}
      </span>

      <span className="flex-1 truncate">{lesson.title}</span>

      {/* Bookmark + reading time */}
      <span className="flex items-center gap-1 shrink-0">
        {isBookmarked && <Bookmark className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
        {readingTime && readingTime > 0 && (
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium tabular-nums">
            {readingTime}m
          </span>
        )}
      </span>
    </Link>
  );
}
