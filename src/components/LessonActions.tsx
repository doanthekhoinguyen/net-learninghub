'use client';

import { ProgressCheckbox } from '@/components/ProgressCheckbox';
import { BookmarkButton } from '@/components/BookmarkButton';
import { NotePanel } from '@/components/NotePanel';
import type { LessonMeta } from '@/types';

interface LessonActionsProps {
  slug: string;
  meta: LessonMeta;
}

export function LessonActions({ slug, meta }: LessonActionsProps) {
  return (
    <div className="flex flex-col gap-3 mb-6">
      <div className="flex flex-wrap items-center gap-2">
        <ProgressCheckbox slug={slug} />
        <BookmarkButton slug={slug} />
      </div>
      <NotePanel slug={slug} />
    </div>
  );
}
