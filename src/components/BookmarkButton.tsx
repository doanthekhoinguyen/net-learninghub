'use client';

import { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { toggleBookmark, getProgress } from '@/lib/storage';
import { cn } from '@/lib/utils';

interface BookmarkButtonProps {
  slug: string;
  className?: string;
}

export function BookmarkButton({ slug, className }: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    const p = getProgress();
    setBookmarked(p.bookmarks.includes(slug));
  }, [slug]);

  const handleToggle = () => {
    const updated = toggleBookmark(slug);
    setBookmarked(updated.bookmarks.includes(slug));
  };

  return (
    <button
      onClick={handleToggle}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
        'border focus:outline-none focus:ring-2 focus:ring-primary-500',
        bookmarked
          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'
          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-amber-300 dark:hover:border-amber-700',
        className
      )}
      aria-label={bookmarked ? 'Bỏ đánh dấu' : 'Đánh dấu'}
    >
      {bookmarked ? (
        <BookmarkCheck className="w-4 h-4 text-amber-500 fill-amber-500" />
      ) : (
        <Bookmark className="w-4 h-4" />
      )}
      {bookmarked ? 'Đã đánh dấu' : 'Đánh dấu'}
    </button>
  );
}
