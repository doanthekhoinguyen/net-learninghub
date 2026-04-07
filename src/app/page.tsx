import { Suspense } from 'react';
import { Dashboard } from '@/components/Dashboard';
import { getAllLessons } from '@/lib/lessons';

export default function HomePage() {
  const lessons = getAllLessons();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Suspense fallback={
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-400 dark:text-slate-500">Đang tải...</div>
        </div>
      }>
        <Dashboard lessons={lessons} />
      </Suspense>
    </div>
  );
}
