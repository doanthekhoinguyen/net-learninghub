'use client';

import { useState, useEffect, useRef } from 'react';
import { FileText, ChevronDown, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getProgress, saveNote } from '@/lib/storage';
import { cn } from '@/lib/utils';

interface NotePanelProps {
  slug: string;
}

export function NotePanel({ slug }: NotePanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [note, setNote] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const p = getProgress();
    setNote(p.notes[slug] ?? '');
  }, [slug]);

  const handleChange = (value: string) => {
    setNote(value);
    setSaveStatus('saving');

    if (saveTimer.current) clearTimeout(saveTimer.current);
    if (savedTimer.current) clearTimeout(savedTimer.current);

    saveTimer.current = setTimeout(() => {
      saveNote(slug, value);
      setSaveStatus('saved');
      savedTimer.current = setTimeout(() => setSaveStatus('idle'), 2000);
    }, 500);
  };

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className={cn(
          'w-full flex items-center justify-between px-4 py-3',
          'text-left font-medium text-slate-700 dark:text-slate-200',
          'hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500'
        )}
      >
        <span className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-400" />
          Ghi chú
          {saveStatus === 'saving' && (
            <span className="text-xs text-slate-400 animate-pulse">Đang lưu...</span>
          )}
          {saveStatus === 'saved' && (
            <span className="flex items-center gap-1 text-xs text-emerald-500">
              <Save className="w-3 h-3" /> Đã lưu
            </span>
          )}
        </span>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-slate-400 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              <textarea
                value={note}
                onChange={e => handleChange(e.target.value)}
                placeholder="Viết ghi chú của bạn ở đây..."
                className={cn(
                  'w-full min-h-[120px] resize-y rounded-lg p-3 text-sm',
                  'bg-slate-50 dark:bg-slate-800',
                  'text-slate-800 dark:text-slate-200',
                  'border border-slate-200 dark:border-slate-700',
                  'placeholder:text-slate-400 dark:placeholder:text-slate-500',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                  'transition-colors'
                )}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
