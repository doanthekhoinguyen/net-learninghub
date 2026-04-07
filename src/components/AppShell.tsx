'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { SearchModal } from '@/components/SearchModal';
import { AIAssistant } from '@/components/AIAssistant';
import { cn } from '@/lib/utils';
import type { LessonMeta, Section } from '@/types';

interface AppShellProps {
  children: React.ReactNode;
  lessons: LessonMeta[];
  sections: Section[];
}

import { SelectionTooltip } from '@/components/SelectionTooltip';
import { GlobalPlayground } from '@/components/GlobalPlayground';

export function AppShell({ children, lessons, sections }: AppShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const openSearch = () => setIsSearchOpen(true);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 relative">
      <Header
        onMenuToggle={() => setIsSidebarOpen(prev => !prev)}
        onSearchOpen={openSearch}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex pt-16">
        {/* Mobile backdrop */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={cn(
            'fixed md:sticky top-16 left-0 z-40',
            'h-[calc(100vh-4rem)] w-72',
            'bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700',
            'transition-transform duration-300 ease-in-out',
            'md:translate-x-0 md:top-16 md:shrink-0',
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <Sidebar lessons={lessons} sections={sections} />
        </div>

        <main className="flex-1 min-h-[calc(100vh-4rem)] relative">
          {children}
        </main>
      </div>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      
      {/* Interactive Widgets */}
      <GlobalPlayground />
      <AIAssistant />
      <SelectionTooltip />
    </div>
  );
}
