'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Flame, Bookmark, BookOpen, CheckCircle2, Clock, TrendingUp, ArrowRight, Sparkles, Database, DownloadCloud, UploadCloud } from 'lucide-react';
import { ProgressBar } from '@/components/ProgressBar';
import { getProgress, updateLastVisit } from '@/lib/storage';
import { SECTIONS } from '@/lib/sections';
import { cn } from '@/lib/utils';
import type { LessonMeta } from '@/types';

interface ProgressData {
  completedLessons: string[];
  bookmarks: string[];
  visitedLessons: string[];
  streak: number;
}

interface DashboardProps {
  lessons: LessonMeta[];
}

const GREETINGS = [
  { hour: [5, 11], text: 'Chào buổi sáng', icon: '🌤️' },
  { hour: [12, 17], text: 'Chào buổi chiều', icon: '☀️' },
  { hour: [18, 21], text: 'Chào buổi tối', icon: '🌙' },
  { hour: [22, 4], text: 'Đã khuya rồi!', icon: '🌙' },
];

function getGreeting() {
  const h = new Date().getHours();
  for (const g of GREETINGS) {
    if (h >= g.hour[0] && h <= g.hour[1]) return g;
  }
  return GREETINGS[3];
}

export function Dashboard({ lessons }: DashboardProps) {
  const [progress, setProgress] = useState<ProgressData>({
    completedLessons: [],
    bookmarks: [],
    visitedLessons: [],
    streak: 1,
  });

  useEffect(() => {
    const p = getProgress();
    setProgress({ completedLessons: p.completedLessons, bookmarks: p.bookmarks, visitedLessons: p.visitedLessons, streak: p.streak });
    updateLastVisit('__dashboard__');
  }, []);

  const total = lessons.length;
  const completed = progress.completedLessons.filter(slug =>
    lessons.some(l => l.slug === slug)
  ).length;
  const overallPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

  const greeting = getGreeting();

  const handleExport = () => {
    const data = localStorage.getItem('nlh_progress');
    if (!data) {
      alert('Không có dữ liệu để tải xuống.');
      return;
    }
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `net-learning-hub-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonStr = event.target?.result as string;
        const parsed = JSON.parse(jsonStr);
        if (parsed && typeof parsed === 'object' && ('streak' in parsed || 'completedLessons' in parsed)) {
          localStorage.setItem('nlh_progress', jsonStr);
          alert('Phục hồi dữ liệu thành công! Trang sẽ tự động tải lại.');
          window.location.reload();
        } else {
          alert('File JSON không hợp lệ hoặc không đúng định dạng của trang web.');
        }
      } catch (err) {
        alert('Có lỗi xảy ra khi đọc file JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Section stats
  const sectionStats = SECTIONS.map(section => {
    const sectionLessons = lessons.filter(l => l.folderName === section.folderName);
    const sectionCompleted = sectionLessons.filter(l =>
      progress.completedLessons.includes(l.slug)
    ).length;
    return {
      id: section.id,
      name: section.name,
      folderName: section.folderName,
      total: sectionLessons.length,
      completed: sectionCompleted,
      percent: sectionLessons.length > 0
        ? Math.round((sectionCompleted / sectionLessons.length) * 100)
        : 0,
    };
  }).filter(s => s.total > 0);

  // Next lesson suggestion: first incomplete lesson
  const nextLesson = lessons.find(l => !progress.completedLessons.includes(l.slug));

  // Recent lessons (last 5 visited)
  const recentLessons = [...progress.visitedLessons]
    .reverse()
    .filter(slug => slug !== '__dashboard__' && lessons.some(l => l.slug === slug))
    .slice(0, 5)
    .map(slug => lessons.find(l => l.slug === slug))
    .filter(Boolean) as LessonMeta[];

  // Bookmarked lessons
  const bookmarkedLessons = progress.bookmarks
    .map(slug => lessons.find(l => l.slug === slug))
    .filter(Boolean) as LessonMeta[];

  return (
    <div className="space-y-8 stagger-children">
      {/* Welcome + Overall Progress */}
      <section>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
              {greeting.text} {greeting.icon}
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Lộ trình học .NET của bạn
            </p>
          </div>
          {progress.streak > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 shrink-0">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-bold text-orange-600 dark:text-orange-400 tabular-nums">
                {progress.streak} ngày
              </span>
            </div>
          )}
        </div>

        {/* Overall progress card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                Tiến độ tổng thể
              </span>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {completed} / {total} bài học hoàn thành
              </p>
            </div>
            <div className="text-right">
              <span className="text-4xl font-black tabular-nums gradient-text">
                {overallPercent}%
              </span>
            </div>
          </div>
          <ProgressBar value={overallPercent} size="lg" showPercent={false} />
        </div>

        {/* Next lesson CTA */}
        {nextLesson && overallPercent < 100 && (
          <Link
            href={`/lesson/${nextLesson.slug}`}
            className={cn(
              'group flex items-center gap-3 p-4 rounded-xl',
              'bg-primary-50 dark:bg-primary-900/20',
              'border border-primary-200 dark:border-primary-800',
              'hover:border-primary-400 dark:hover:border-primary-600',
              'transition-all duration-200 hover:shadow-sm',
              'cursor-pointer'
            )}
          >
            <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/40 text-primary-500 dark:text-primary-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-0.5">
                Bài tiếp theo
              </p>
              <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 truncate">
                {nextLesson.title}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {nextLesson.sectionName}
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-primary-400 group-hover:translate-x-1 transition-transform shrink-0" />
          </Link>
        )}
      </section>

      {/* Quick Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Tổng bài', value: total, icon: BookOpen, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-400 dark:bg-blue-950/20' },
          { label: 'Hoàn thành', value: completed, icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400 dark:bg-emerald-950/20' },
          { label: 'Đang học', value: progress.visitedLessons.filter(s => s !== '__dashboard__' && !progress.completedLessons.includes(s) && lessons.some(l => l.slug === s)).length, icon: TrendingUp, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400 dark:bg-amber-950/20' },
          { label: 'Ngày streak', value: progress.streak || 1, icon: Flame, color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/30 dark:text-orange-400 dark:bg-orange-950/20' },
        ].map(stat => (
          <div key={stat.label} className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-3">
            <div className={cn('p-2 rounded-lg shrink-0', stat.color)}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{stat.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Section Progress */}
      <section>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Tiến độ theo phần</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sectionStats.map(stat => (
            <div key={stat.id} className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-200 truncate pr-2">{stat.name}</h3>
                <span className={cn(
                  'text-sm font-bold shrink-0',
                  stat.percent === 100
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-primary-600 dark:text-primary-400'
                )}>
                  {stat.percent}%
                </span>
              </div>
              <ProgressBar value={stat.percent} size="sm" showPercent={false} />
              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                {stat.completed}/{stat.total} bài
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent + Bookmarks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Lessons */}
        <section>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-400" />
            Học gần đây
          </h2>
          {recentLessons.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 text-sm bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
              Chưa có bài học nào được truy cập. Bắt đầu ngay!
            </p>
          ) : (
            <div className="space-y-2">
              {recentLessons.map(lesson => (
                <Link
                  key={lesson.slug}
                  href={`/lesson/${lesson.slug}`}
                  className="group flex items-center gap-3 bg-white dark:bg-slate-900 rounded-xl px-4 py-3 shadow-sm border border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-sm transition-all duration-200"
                >
                  <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 group-hover:text-primary-500 transition-colors">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{lesson.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{lesson.sectionName}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-primary-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Bookmarked */}
        <section>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-amber-500 fill-amber-500" />
            Đã đánh dấu
          </h2>
          {bookmarkedLessons.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 text-sm bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
              Chưa có bài nào được đánh dấu. Nhấn bookmark ở trang bài học để lưu lại.
            </p>
          ) : (
            <div className="space-y-2">
              {bookmarkedLessons.map(lesson => (
                <Link
                  key={lesson.slug}
                  href={`/lesson/${lesson.slug}`}
                  className="group flex items-center gap-3 bg-white dark:bg-slate-900 rounded-xl px-4 py-3 shadow-sm border border-slate-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-600 hover:shadow-sm transition-all duration-200"
                >
                  <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-400">
                    <Bookmark className="w-4 h-4 fill-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">{lesson.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{lesson.sectionName}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Backup / Export / Import */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 mt-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-500" />
              Quản lý dữ liệu
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Sao lưu và khôi phục tiến độ học tập.
            </p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={handleExport}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl transition-colors text-sm shadow-sm border border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              <DownloadCloud className="w-4 h-4" />
              Tải Xuống
            </button>
            <label className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 border border-indigo-600 text-white font-medium rounded-xl transition-colors text-sm shadow-sm cursor-pointer">
              <UploadCloud className="w-4 h-4 text-indigo-100" />
              Khôi Phục
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImport}
              />
            </label>
          </div>
        </div>
      </section>
    </div>
  );
}
