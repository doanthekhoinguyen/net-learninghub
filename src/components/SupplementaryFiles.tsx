'use client';

import Link from 'next/link';
import { FileText, ExternalLink } from 'lucide-react';
import type { LessonMeta } from '@/types';
import { cn } from '@/lib/utils';

interface SupplementaryFilesProps {
  files: { name: string; path: string }[];
  slug: string;
}

export function SupplementaryFiles({ files, slug }: SupplementaryFilesProps) {
  if (!files.length) return null;

  return (
    <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-700">
      <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5 text-slate-400" />
        Tài liệu bổ sung
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {files.map(file => (
          <Link
            key={file.name}
            href={`/lesson/${encodeURIComponent(slug + '+' + file.name)}`}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl',
              'bg-white dark:bg-slate-900',
              'border border-slate-200 dark:border-slate-700',
              'hover:border-primary-300 dark:hover:border-primary-600',
              'hover:shadow-sm transition-all duration-200',
              'group'
            )}
          >
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors">
              <FileText className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-slate-700 dark:text-slate-200 truncate">
                {file.name}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Tài liệu bổ sung</p>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ))}
      </div>
    </div>
  );
}
