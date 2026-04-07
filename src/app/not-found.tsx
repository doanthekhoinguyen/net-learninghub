import Link from 'next/link';
import { Home, Search, BookOpen, ArrowRight } from 'lucide-react';
import { getAllLessons } from '@/lib/lessons';
import { SECTIONS } from '@/lib/sections';

export default function NotFound() {
  const lessons = getAllLessons();

  // Get first 3 lessons as suggestions
  const suggestions = lessons.slice(0, 3);

  return (
    <div className="max-w-2xl mx-auto px-6 py-16 text-center animate-fade-in">
      {/* 404 Hero */}
      <div className="mb-8">
        <div className="text-[120px] font-black leading-none text-slate-100 dark:text-slate-800 select-none mb-[-20px]">
          404
        </div>
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary-100 dark:bg-primary-900/30 mb-4">
          <BookOpen className="w-10 h-10 text-primary-500" />
        </div>
      </div>

      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
        Trang không tìm thấy
      </h1>
      <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">
        Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
        Hãy quay lại trang chủ hoặc tìm kiếm bài học bạn cần.
      </p>

      {/* Quick actions */}
      <div className="flex items-center justify-center gap-3 mb-12">
        <Link
          href="/"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors shadow-sm"
        >
          <Home className="w-4 h-4" />
          Về trang chủ
        </Link>
        <Link
          href="/search"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium transition-colors border border-slate-200 dark:border-slate-700"
        >
          <Search className="w-4 h-4" />
          Tìm kiếm bài học
        </Link>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="text-left">
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
            Bài học gợi ý
          </h2>
          <div className="space-y-2">
            {suggestions.map(lesson => (
              <Link
                key={lesson.slug}
                href={`/lesson/${lesson.slug}`}
                className="group flex items-center justify-between px-4 py-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-sm transition-all duration-150"
              >
                <div className="text-left">
                  <p className="font-medium text-sm text-slate-700 dark:text-slate-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {lesson.title}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{lesson.sectionName}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors shrink-0" />
              </Link>
            ))}
          </div>

          <p className="mt-4 text-xs text-slate-400 text-center">
            hoặc{' '}
            <Link href="/" className="text-primary-600 dark:text-primary-400 hover:underline">
              xem toàn bộ lộ trình học
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}