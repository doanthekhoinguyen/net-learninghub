'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X, FileText, ArrowRight } from 'lucide-react';
import Fuse from 'fuse.js';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { LessonMeta } from '@/types';

interface SearchItem {
  lesson: LessonMeta;
  content: string;
  snippet: string;
}

function SearchPageInner({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [fuse, setFuse] = useState<Fuse<SearchItem> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch lessons + content from API
  useEffect(() => {
    setIsLoading(true);
    fetch('/api/lessons')
      .then(r => r.json())
      .then(({ lessons, content }) => {
        const items: SearchItem[] = lessons.map((lesson: LessonMeta) => {
          const c = (content as { slug: string; content: string }[]).find((x) => x.slug === lesson.slug);
          const snippet = c
            ? c.content.slice(0, 200).replace(/[#*`\[\]]/g, ' ').replace(/\s+/g, ' ').trim() + '...'
            : '';
          return { lesson, content: c?.content ?? '', snippet };
        });

        const f = new Fuse(items, {
          keys: [
            { name: 'lesson.title', weight: 2 },
            { name: 'lesson.sectionName', weight: 1 },
            { name: 'content', weight: 0.5 },
          ],
          threshold: 0.4,
          includeMatches: true,
        });
        setFuse(f);
        setIsLoading(false);

        // Run initial search if query exists
        if (initialQuery.trim()) {
          const r = f.search(initialQuery).slice(0, 20);
          setResults(r.map(x => x.item));
        }
      })
      .catch(() => setIsLoading(false));
  }, [initialQuery]);

  // Update URL when query changes (no page reload)
  const updateQuery = useCallback((newQuery: string) => {
    setQuery(newQuery);
    const params = new URLSearchParams(searchParams.toString());
    if (newQuery.trim()) {
      params.set('q', newQuery);
    } else {
      params.delete('q');
    }
    router.replace(`/search?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  // Debounced search
  useEffect(() => {
    if (!fuse) return;
    if (!query.trim()) {
      setResults([]);
      setSelectedIndex(0);
      return;
    }
    const timer = setTimeout(() => {
      const r = fuse.search(query).slice(0, 20);
      setResults(r.map(x => x.item));
      setSelectedIndex(0);
    }, 200);
    return () => clearTimeout(timer);
  }, [query, fuse]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      router.push(`/lesson/${results[selectedIndex].lesson.slug}`);
    }
  }, [results, selectedIndex, router]);

  const navigateTo = (slug: string) => router.push(`/lesson/${slug}`);

  // Group results by section
  const grouped = results.reduce<Record<string, SearchItem[]>>((acc, item) => {
    const section = item.lesson.sectionName;
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {});

  let flatIndex = -1;

  return (
    <div className="max-w-3xl mx-auto p-6 pb-20 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Tìm kiếm bài học</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Tìm kiếm nhanh trong toàn bộ lộ trình học</p>
      </div>

      {/* Search input */}
      <div className="flex items-center gap-3 px-4 py-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm mb-6">
        <Search className="w-5 h-5 text-slate-400 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={e => updateQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nhập từ khóa: C#, LINQ, Entity Framework..."
          autoFocus
          className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 outline-none text-base"
        />
        {query && (
          <button
            onClick={() => updateQuery('')}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Xóa tìm kiếm"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        )}
      </div>

      {/* Status line */}
      {!isLoading && (
        <div className="mb-4 flex items-center justify-between">
          {results.length > 0 && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Tìm thấy <strong className="text-slate-700 dark:text-slate-300">{results.length}</strong> kết quả
              {query ? ` cho "${query}"` : ''}
            </p>
          )}
          {query && results.length === 0 && !isLoading && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Không có kết quả nào cho "{query}"
            </p>
          )}
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="py-16 flex items-center justify-center">
          <div className="flex items-center gap-3 text-slate-400">
            <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Đang tải dữ liệu...</span>
          </div>
        </div>
      )}

      {/* Empty query state */}
      {!isLoading && !query && (
        <div className="py-12 text-center">
          <Search className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Nhập từ khóa để tìm kiếm bài học
          </p>
        </div>
      )}

      {/* No results */}
      {!isLoading && query && results.length === 0 && (
        <div className="py-16 text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
          <p className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-1">
            Không tìm thấy kết quả
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Thử từ khóa khác hoặc kiểm tra chính tả
          </p>
        </div>
      )}

      {/* Results grouped by section */}
      {!isLoading && Object.entries(grouped).map(([sectionName, items]) => (
        <div key={sectionName} className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {sectionName}
            </h2>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            <span className="text-xs text-slate-400">{items.length} bài</span>
          </div>

          <div className="space-y-2">
            {items.map(item => {
              flatIndex++;
              const idx = flatIndex;
              return (
                <motion.button
                  key={item.lesson.slug}
                  onClick={() => navigateTo(item.lesson.slug)}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.12 }}
                  className={cn(
                    'w-full flex items-start gap-3 px-4 py-3.5 rounded-xl text-left transition-all duration-150',
                    'border',
                    idx === selectedIndex
                      ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:shadow-sm'
                  )}
                >
                  <div className={cn(
                    'p-2 rounded-lg shrink-0 mt-0.5',
                    idx === selectedIndex
                      ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-500'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  )}>
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{item.lesson.title}</p>
                    {item.snippet && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {item.snippet}
                      </p>
                    )}
                  </div>
                  <ArrowRight className={cn(
                    'w-4 h-4 mt-1 shrink-0 transition-opacity',
                    idx === selectedIndex ? 'opacity-80' : 'opacity-30'
                  )} />
                </motion.button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Keyboard hints */}
      {results.length > 0 && (
        <div className="mt-8 pt-5 border-t border-slate-200 dark:border-slate-700 flex items-center gap-5 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px]">↑↓</kbd>
            di chuyển
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px]">↵</kbd>
            mở bài học
          </span>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="max-w-3xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div>
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg w-56 mb-1" />
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-72" />
          </div>
          <div className="h-14 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
          <div className="space-y-3 mt-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    }>
      <SearchPageWithQuery />
    </Suspense>
  );
}

function SearchPageWithQuery() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';
  return <SearchPageInner initialQuery={initialQuery} />;
}
