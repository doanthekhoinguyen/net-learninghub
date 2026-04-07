'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { Breadcrumb } from '@/components/Breadcrumb';
import { LessonActions } from '@/components/LessonActions';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { SupplementaryFiles } from '@/components/SupplementaryFiles';
import { TableOfContents, parseMarkdownHeadings } from '@/components/TableOfContents';
import type { LessonMeta } from '@/types';
import { cn } from '@/lib/utils';

interface LessonPageClientProps {
  slug: string;
  content: string;
  meta: LessonMeta;
  prevLesson: LessonMeta | null;
  nextLesson: LessonMeta | null;
}

export function LessonPageClient({ slug, content, meta, prevLesson, nextLesson }: LessonPageClientProps) {
  const [progress, setProgress] = useState(0);

  // Scroll progress indicator
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? Math.min(100, Math.round((scrollTop / docHeight) * 100)) : 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard prev/next navigation (Alt+← / Alt+→)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'ArrowLeft' && prevLesson) {
        window.location.href = `/lesson/${prevLesson.slug}`;
      }
      if (e.altKey && e.key === 'ArrowRight' && nextLesson) {
        window.location.href = `/lesson/${nextLesson.slug}`;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [prevLesson, nextLesson]);

  // Reading time estimate
  const wordCount = content.trim().split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  // Parse headings for TOC
  const headings = parseMarkdownHeadings(content);

  return (
    <>
      {/* Scroll progress bar */}
      <div
        className="scroll-progress"
        style={{ width: `${progress}%`, opacity: progress > 0 ? 1 : 0 }}
        aria-hidden="true"
      />

      {/* 2-column layout: content + TOC on xl screens */}
      <div className="max-w-[88rem] mx-auto px-6 pb-20 pt-2">
        <div className="flex gap-10 items-start">

          {/* Main content */}
          <div className="flex-1 min-w-0 max-w-4xl">
            <Breadcrumb slug={slug} />

            {/* Lesson header */}
            <div className="flex items-start justify-between gap-4 mb-1">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                {meta.title}
              </h1>
              <div className="flex items-center gap-1.5 shrink-0 mt-2 text-sm text-slate-400 dark:text-slate-500">
                <Clock className="w-4 h-4" />
                <span className="tabular-nums">{readingTime} phút đọc</span>
              </div>
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              {meta.sectionName}
            </p>

            <LessonActions slug={slug} meta={meta} />

            <div className="mt-2">
              <MarkdownRenderer content={content} />
            </div>

            {meta.supplementaryFiles.length > 0 && (
              <SupplementaryFiles files={meta.supplementaryFiles} slug={slug} />
            )}

            {/* Prev / Next navigation */}
            <div className="flex items-center justify-between gap-4 mt-10 pt-6 border-t border-slate-200 dark:border-slate-700">
              {prevLesson ? (
                <Link
                  href={`/lesson/${prevLesson.slug}`}
                  className={cn(
                    'group flex items-center gap-2 px-4 py-3 rounded-xl',
                    'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700',
                    'hover:border-primary-300 dark:hover:border-primary-600',
                    'transition-all duration-200 hover:shadow-sm max-w-[45%]'
                  )}
                >
                  <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-primary-500 shrink-0 transition-colors" />
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Bài trước</p>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {prevLesson.title}
                    </p>
                  </div>
                </Link>
              ) : <div />}

              {nextLesson ? (
                <Link
                  href={`/lesson/${nextLesson.slug}`}
                  className={cn(
                    'group flex items-center gap-2 px-4 py-3 rounded-xl',
                    'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700',
                    'hover:border-primary-300 dark:hover:border-primary-600',
                    'transition-all duration-200 hover:shadow-sm max-w-[45%] ml-auto text-right'
                  )}
                >
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Bài tiếp theo</p>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {nextLesson.title}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-primary-500 shrink-0 transition-colors" />
                </Link>
              ) : <div />}
            </div>
          </div>

          {/* Table of Contents — sticky right panel, xl only */}
          <TableOfContents headings={headings} />

        </div>
      </div>
    </>
  );
}
