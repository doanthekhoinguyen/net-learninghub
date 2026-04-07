'use client';

import { useState, useEffect } from 'react';
import { AlignLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Heading {
  id: string;
  text: string;
  level: number;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/** Parse h1/h2/h3 headings from raw markdown, skipping code blocks */
export function parseMarkdownHeadings(content: string): Heading[] {
  const lines = content.split('\n');
  const headings: Heading[] = [];
  let inCodeBlock = false;

  for (const line of lines) {
    if (line.trimStart().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    const match = line.match(/^(#{1,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      headings.push({ id: slugify(text), text, level });
    }
  }

  return headings;
}

interface TableOfContentsProps {
  headings: Heading[];
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');

  // Intersection Observer to track which heading is currently visible
  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-5% 0% -85% 0%', threshold: 0 }
    );

    for (const h of headings) {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <nav
      aria-label="Mục lục bài học"
      className="hidden xl:block w-52 shrink-0"
    >
      <div className="sticky top-24">
        {/* Header */}
        <p className="flex items-center gap-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-1">
          <AlignLeft className="w-3.5 h-3.5" />
          Mục lục
        </p>

        {/* Heading list */}
        <div className="space-y-0.5 max-h-[calc(100vh-10rem)] overflow-y-auto pr-1">
          {headings.map((h) => (
            <a
              key={`${h.id}-${h.level}`}
              href={`#${h.id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                setActiveId(h.id);
              }}
              className={cn(
                'block py-1 px-2 rounded-md text-xs leading-snug transition-all duration-150 truncate',
                h.level === 1 && 'pl-2 font-medium',
                h.level === 2 && 'pl-4',
                h.level === 3 && 'pl-6 opacity-80',
                activeId === h.id
                  ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              )}
              title={h.text}
            >
              {h.text}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
