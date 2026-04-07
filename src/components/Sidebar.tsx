'use client';

import { useState, useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LessonCard } from '@/components/LessonCard';
import { getProgress } from '@/lib/storage';
import { getSectionColor } from '@/lib/sections';
import { cn } from '@/lib/utils';
import type { LessonMeta, Section } from '@/types';

interface SidebarProps {
  lessons: LessonMeta[];
  sections: Section[];
}

export function Sidebar({ lessons, sections }: SidebarProps) {
  const pathname = usePathname();
  const [progress, setProgress] = useState({ completedLessons: [] as string[], bookmarks: [] as string[] });
  // Default: only first section expanded
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    if (sections.length > 0) {
      initial[sections[0].id] = true;
    }
    return initial;
  });

  useEffect(() => {
    const p = getProgress();
    setProgress({ completedLessons: p.completedLessons, bookmarks: p.bookmarks });
  }, []);

  // Memoize derived data to prevent infinite loops
  const sectionsWithLessons = useMemo(() =>
    sections
      .map(section => ({
        ...section,
        lessons: lessons.filter(l => l.folderName === section.folderName),
      }))
      .filter(s => s.lessons.length > 0),
    [sections, lessons]
  );

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const isActiveLesson = (slug: string) => pathname === `/lesson/${slug}`;
  const isCompleted = (slug: string) => progress.completedLessons.includes(slug);
  const isBookmarked = (slug: string) => progress.bookmarks.includes(slug);

  const sectionCompletedCount = (sectionId: string) => {
    const section = sectionsWithLessons.find(s => s.id === sectionId);
    if (!section) return 0;
    return section.lessons.filter(l => progress.completedLessons.includes(l.slug)).length;
  };

  // Find active section and auto-expand it — run only when pathname changes
  useEffect(() => {
    if (!pathname.startsWith('/lesson/')) return;
    const slug = pathname.replace('/lesson/', '');
    const lesson = lessons.find(l => l.slug === slug);
    if (!lesson) return;

    setExpandedSections(prev => {
      // Only update if the target section isn't already expanded
      const targetSection = sectionsWithLessons.find(s => s.folderName === lesson.folderName);
      if (!targetSection) return prev;
      if (prev[targetSection.id]) return prev; // already expanded — skip
      return { ...prev, [targetSection.id]: true };
    });
  }, [pathname, lessons, sectionsWithLessons]);

  return (
    <nav className="p-3 space-y-1" aria-label="Lesson navigation">
      {sectionsWithLessons.map(section => {
        const isExpanded = !!expandedSections[section.id];
        const completed = sectionCompletedCount(section.id);
        const total = section.lessons.length;
        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
        const colorClass = getSectionColor(section.folderName);

        return (
          <div key={section.id} className="mb-1">
            {/* Section header */}
            <button
              onClick={() => toggleSection(section.id)}
              className={cn(
                'flex items-center justify-between w-full px-3 py-2 rounded-lg',
                'text-left transition-all duration-150',
                'hover:bg-slate-100 dark:hover:bg-slate-800',
                'focus:outline-none focus:ring-2 focus:ring-primary-500/50',
                isExpanded
                  ? 'bg-slate-50 dark:bg-slate-800/50'
                  : ''
              )}
            >
              <div className="flex items-center gap-2 min-w-0">
                {/* Color dot */}
                <span className={cn('section-dot flex-shrink-0 mt-[3px]', colorClass)} />
                <span className={cn(
                  'text-sm font-semibold truncate',
                  isExpanded
                    ? 'text-slate-900 dark:text-white'
                    : 'text-slate-700 dark:text-slate-300'
                )}>
                  {section.name}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0 ml-2">
                {/* Mini progress ring */}
                {percent > 0 && (
                  <div className="relative w-5 h-5" title={`${percent}% hoàn thành`}>
                    <svg className="w-5 h-5 -rotate-90" viewBox="0 0 20 20">
                      <circle cx="10" cy="10" r="7" fill="none" strokeWidth="3"
                        className="stroke-slate-200 dark:stroke-slate-700" />
                      <circle cx="10" cy="10" r="7" fill="none" strokeWidth="3"
                        strokeDasharray={`${percent * 0.44} 44`}
                        strokeLinecap="round"
                        className={cn(
                          percent >= 100 ? 'stroke-emerald-500' : 'stroke-primary-500',
                          'transition-all duration-500'
                        )} />
                    </svg>
                    {percent === 100 && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[7px] font-bold text-emerald-500 leading-none">✓</span>
                      </span>
                    )}
                  </div>
                )}

                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 tabular-nums">
                  {completed}/{total}
                </span>
                <ChevronDown
                  className={cn(
                    'w-4 h-4 text-slate-400 transition-transform duration-200',
                    isExpanded && 'rotate-180'
                  )}
                />
              </div>
            </button>

            {/* Lesson list */}
            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="pl-2 pt-1 pb-1 space-y-0.5">
                    {section.lessons.map(lesson => (
                      <LessonCard
                        key={lesson.slug}
                        lesson={lesson}
                        isActive={isActiveLesson(lesson.slug)}
                        isCompleted={isCompleted(lesson.slug)}
                        isBookmarked={isBookmarked(lesson.slug)}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </nav>
  );
}
