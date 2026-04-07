import { notFound } from 'next/navigation';
import { getLessonContent, getAllLessons, getSupplementaryContent } from '@/lib/lessons';
import { LessonPageClient } from '@/components/LessonPageClient';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string[] }>;
}

export async function generateStaticParams() {
  const lessons = getAllLessons();
  const params: { slug: string[] }[] = [];

  for (const l of lessons) {
    params.push({ slug: l.slug.split('/') });
  }

  for (const lesson of lessons) {
    for (const file of lesson.supplementaryFiles) {
      params.push({
        slug: [lesson.slug.split('/')[0], lesson.slug.split('/').slice(1).join('/') + '+' + file.name],
      });
    }
  }

  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: slugParts } = await params;
  const slugStr = slugParts.join('/');

  const sepIdx = slugStr.lastIndexOf('+');
  if (sepIdx !== -1) {
    const filename = slugStr.slice(sepIdx + 1);
    return {
      title: `${filename} — Net Learning Hub`,
      description: `Tài liệu bổ sung: ${filename}`,
    };
  }

  const result = getLessonContent(slugStr);
  if (!result) return { title: 'Không tìm thấy' };
  return {
    title: `${result.meta.title} — Net Learning Hub`,
    description: `Bài học: ${result.meta.title} — ${result.meta.sectionName}`,
  };
}

export default async function LessonPage({ params }: Props) {
  const { slug: slugParts } = await params;
  const slugStr = slugParts.join('/');

  // Supplementary file route
  const sepIdx = slugStr.lastIndexOf('+');
  if (sepIdx !== -1) {
    const slug = slugStr.slice(0, sepIdx);
    const filename = slugStr.slice(sepIdx + 1);
    const raw = getSupplementaryContent(slug, filename);
    if (!raw) notFound();

    return (
      <div className="max-w-4xl mx-auto p-6 pb-20">
        <Link
          href={`/lesson/${encodeURIComponent(slug)}`}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Quay lại bài học
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">{filename}</h1>
        <MarkdownRenderer content={raw} />
      </div>
    );
  }

  // Normal lesson page
  const result = getLessonContent(slugStr);
  if (!result) notFound();

  const { content, meta } = result;
  const allLessons = getAllLessons();
  const currentIndex = allLessons.findIndex(l => l.slug === slugStr);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  return (
    <LessonPageClient
      slug={slugStr}
      content={content}
      meta={meta}
      prevLesson={prevLesson}
      nextLesson={nextLesson}
    />
  );
}
