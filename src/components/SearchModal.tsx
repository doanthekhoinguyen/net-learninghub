'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, FileText, ArrowRight } from 'lucide-react';
import Fuse from 'fuse.js';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { LessonMeta } from '@/types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchItem {
  lesson: LessonMeta;
  content: string;
  snippet: string;
  readingTime: number;
}

/** Strip markdown syntax and return clean plain text */
function cleanSnippet(raw: string, maxLen = 180): string {
  return raw
    .replace(/```[\s\S]*?```/g, '') // remove code blocks
    .replace(/`[^`]*`/g, '')       // remove inline code
    .replace(/#{1,6}\s+/g, '')     // remove headings
    .replace(/[*_~]+/g, '')         // remove bold/italic/strike
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links → text
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')    // images
    .replace(/^\s*[-*+>|]\s*/gm, '')         // list markers, blockquotes
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen);
}

/** Wrap matched keyword in <mark> for highlighting */
function highlightKeyword(text: string, keyword: string): string {
  if (!keyword.trim()) return text;
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replace(new RegExp(`(${escaped})`, 'gi'), '<mark>$1</mark>');
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [fuse, setFuse] = useState<Fuse<SearchItem> | null>(null);
  const [searchItems, setSearchItems] = useState<SearchItem[]>([]);

  // Estimate reading time from word count (200 wpm)
  const estimateReadingTime = (text: string): number => {
    const words = text.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  };

  // Fetch lessons + content from API when modal opens
  useEffect(() => {
    if (!isOpen) return;
    fetch('/api/lessons')
      .then(r => r.json())
      .then(({ lessons, content }) => {
        const items: SearchItem[] = lessons.map((lesson: LessonMeta) => {
          const c = (content as { slug: string; content: string }[]).find(x => x.slug === lesson.slug);
          return {
            lesson,
            content: c?.content ?? '',
            snippet: cleanSnippet(c?.content ?? ''),
            readingTime: estimateReadingTime(c?.content ?? ''),
          };
        });
        setSearchItems(items);
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
      })
      .catch(() => {});
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!fuse || !query.trim()) {
      setResults([]);
      setSelectedIndex(0);
      return;
    }
    const timer = setTimeout(() => {
      const r = fuse.search(query).slice(0, 20);
      setResults(r.map(x => x.item));
      setSelectedIndex(0);
    }, 250);
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
      navigateTo(results[selectedIndex].lesson.slug);
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [results, selectedIndex, onClose]);

  const navigateTo = (slug: string) => {
    router.push(`/lesson/${slug}`);
    onClose();
  };

  // Cmd+K global listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Group results by section
  const grouped = results.reduce<Record<string, SearchItem[]>>((acc, item) => {
    const section = item.lesson.sectionName;
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {});

  let flatIndex = -1;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh]"
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="relative w-full max-w-2xl mx-4 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
        >
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-200 dark:border-slate-700">
            <Search className="w-5 h-5 text-slate-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tìm kiếm bài học..."
              className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 outline-none text-base"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs font-mono text-slate-500">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto p-2">
            {/* No results */}
            {query && results.length === 0 && (
              <div className="py-14 text-center text-slate-500 dark:text-slate-400">
                <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Không tìm thấy kết quả cho "{query}"</p>
                <p className="text-sm mt-1 opacity-70">Thử từ khóa khác hoặc kiểm tra chính tả</p>
              </div>
            )}

            {/* Empty state */}
            {!query && (
              <div className="py-10 text-center text-slate-400 dark:text-slate-500 text-sm space-y-1">
                {searchItems.length === 0 ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    <span>Đang tải dữ liệu...</span>
                  </div>
                ) : (
                  <p>Gõ từ khóa để tìm kiếm trong {searchItems.length} bài học</p>
                )}
              </div>
            )}

            {/* Results list */}
            {Object.entries(grouped).map(([sectionName, items]) => (
              <div key={sectionName} className="mb-2">
                <p className="px-3 py-1.5 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  {sectionName}
                </p>
                {items.map(item => {
                  flatIndex++;
                  const idx = flatIndex;
                  const highlightedTitle = highlightKeyword(item.lesson.title, query);
                  const highlightedSnippet = highlightKeyword(item.snippet, query);

                  return (
                    <button
                      key={item.lesson.slug}
                      onClick={() => navigateTo(item.lesson.slug)}
                      className={cn(
                        'w-full flex items-start gap-3 px-3 py-3 rounded-xl text-left transition-all duration-150',
                        idx === selectedIndex
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 shadow-sm border border-primary-100 dark:border-primary-800'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-transparent'
                      )}
                    >
                      <FileText className={cn(
                        'w-4 h-4 mt-0.5 shrink-0 transition-colors',
                        idx === selectedIndex ? 'text-primary-400' : 'text-slate-400'
                      )} />
                      <div className="flex-1 min-w-0">
                        <p
                          className="font-semibold text-sm leading-tight"
                          dangerouslySetInnerHTML={{ __html: highlightedTitle }}
                        />
                        {item.snippet && (
                          <p
                            className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: highlightedSnippet }}
                          />
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {item.readingTime > 0 && (
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 tabular-nums">
                            {item.readingTime} phút
                          </span>
                        )}
                        <ArrowRight className={cn(
                          'w-4 h-4 transition-all duration-150',
                          idx === selectedIndex ? 'text-primary-400 opacity-80 translate-x-0.5' : 'opacity-30'
                        )} />
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Footer */}
          {results.length > 0 && (
            <div className="px-4 py-2.5 border-t border-slate-200 dark:border-slate-700 flex items-center gap-5 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">↑↓</kbd>
                di chuyển
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">↵</kbd>
                chọn
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">ESC</kbd>
                đóng
              </span>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
