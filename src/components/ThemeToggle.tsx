'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <button className={cn('p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors', className)}>
        <span className="sr-only">Chuyển đổi giao diện</span>
        <div className="w-5 h-5" />
      </button>
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn(
        'relative p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-primary-500',
        className
      )}
      title={isDark ? 'Bật chế độ sáng' : 'Bật chế độ tối'}
      aria-label={isDark ? 'Bật chế độ sáng' : 'Bật chế độ tối'}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="sun"
            initial={{ rotate: -90, opacity: 0, scale: 0.7 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.2 }}
          >
            <Sun className="w-5 h-5 text-amber-400" />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ rotate: 90, opacity: 0, scale: 0.7 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: -90, opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.2 }}
          >
            <Moon className="w-5 h-5 text-slate-600" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
