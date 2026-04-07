'use client';

import { Search, Bookmark, Menu, X } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface HeaderProps {
  onMenuToggle: () => void;
  onSearchOpen: () => void;
  isSidebarOpen: boolean;
}

export function Header({ onMenuToggle, onSearchOpen, isSidebarOpen }: HeaderProps) {
  const pathname = usePathname();

  // Derive breadcrumb from /lesson/slug
  let breadcrumb: string | null = null;
  if (pathname.startsWith('/lesson/')) {
    const parts = pathname.replace('/lesson/', '').split('/');
    if (parts.length > 1) {
      // Show section name from folder name
      const sectionSlug = parts[0];
      breadcrumb = sectionSlug
        .replace(/\d+\./, '') // remove "0.", "1." prefix
        .replace(/([A-Z])/g, ' $1') // add space before capitals
        .replace(/_/g, ' ')
        .trim();
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 flex items-center px-4 gap-3">
      {/* Mobile hamburger */}
      <button
        onClick={onMenuToggle}
        className={cn(
          'md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-primary-500'
        )}
        aria-label="Toggle menu"
      >
        {isSidebarOpen ? (
          <X className="w-5 h-5 text-slate-700 dark:text-slate-200" />
        ) : (
          <Menu className="w-5 h-5 text-slate-700 dark:text-slate-200" />
        )}
      </button>

      {/* Logo — clickable back to home */}
      <Link
        href="/"
        className="flex-1 md:flex-none flex items-center gap-2.5 group"
        aria-label="Về trang chủ"
      >
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center shadow-sm shadow-primary-500/20 group-hover:scale-105 transition-transform duration-150">
          <span className="text-white font-black text-xs tracking-tight">.N</span>
        </div>
        <span className="hidden sm:block font-bold text-slate-900 dark:text-white text-base tracking-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          Net Learning Hub
        </span>
      </Link>

      {/* Breadcrumb */}
      {breadcrumb && (
        <div className="hidden lg:flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
          <span className="opacity-40">/</span>
          <span className="font-medium">{breadcrumb}</span>
        </div>
      )}

      {/* Right actions */}
      <div className="flex items-center gap-1 ml-auto">
        <button
          onClick={onSearchOpen}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-lg',
            'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400',
            'hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-primary-500',
            'text-sm border border-transparent hover:border-slate-300 dark:hover:border-slate-600'
          )}
          aria-label="Search lessons"
        >
          <Search className="w-4 h-4" />
          <span className="hidden sm:inline">Tìm kiếm...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-xs font-mono font-medium">
            ⌘K
          </kbd>
        </button>

        <ThemeToggle />
      </div>
    </header>
  );
}
