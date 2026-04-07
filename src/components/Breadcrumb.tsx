'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { SECTIONS } from '@/lib/sections';
import { parseNormalizedSlug } from '@/lib/sections';
import { cn } from '@/lib/utils';

interface BreadcrumbProps {
  slug: string;
}

export function Breadcrumb({ slug }: BreadcrumbProps) {
  const { section: sectionFolder, lesson: lessonSlug } = parseNormalizedSlug(slug);

  const section = SECTIONS.find(s => s.folderName === sectionFolder);

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 mb-6"
    >
      <Link
        href="/"
        className="flex items-center gap-1 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Trang chủ</span>
      </Link>
      <ChevronRight className="w-3.5 h-3.5" />
      {section && (
        <>
          <span className="text-slate-700 dark:text-slate-300 font-medium">{section.name}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </>
      )}
      <span className="text-slate-700 dark:text-slate-300 font-medium truncate">{lessonSlug}</span>
    </nav>
  );
}
