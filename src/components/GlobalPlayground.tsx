'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, X, Play, Loader2, Code2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function GlobalPlayground() {
  const [isOpen, setIsOpen] = useState(false);
  const [code, setCode] = useState(`using System;

public class Program
{
    public static void Main()
    {
        Console.WriteLine("Hello, .NET Fiddle Sandbox!");
    }
}`);
  const [isRunning, setIsRunning] = useState(false);
  const [runOutput, setRunOutput] = useState<{
    ConsoleOutput?: string;
    HasCompilationErrors?: boolean;
    HasErrors?: boolean;
    ErrorMessage?: string;
  } | null>(null);

  const handleRunCode = async () => {
    setIsRunning(true);
    setRunOutput(null);
    try {
      const res = await fetch('/api/run-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      const data = await res.json();
      setRunOutput(data);
    } catch (err: any) {
      setRunOutput({ HasErrors: true, ErrorMessage: 'Lỗi máy chủ Proxy: ' + err.message });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button (Bottom Left) */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1, transition: { delay: 0.3 } }}
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 left-6 z-40 p-4 rounded-2xl shadow-xl border",
          "bg-slate-900 border-slate-800 text-white hover:bg-slate-800",
          "transition-all duration-300 flex items-center gap-2",
          isOpen ? 'opacity-0 pointer-events-none scale-90' : 'opacity-100 scale-100'
        )}
      >
        <Code2 className="w-6 h-6 text-emerald-400" />
        <span className="font-semibold lg:block hidden">C# Sandbox</span>
      </motion.button>

      {/* Floating Playground Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn(
              "fixed bottom-6 left-6 z-50 overflow-hidden",
              "w-[90vw] max-w-[800px] h-[80vh] max-h-[700px]",
              "bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800",
              "rounded-2xl shadow-2xl flex flex-col"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold text-slate-800 dark:text-slate-200">Interactive C# Sandbox</h3>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleRunCode}
                  disabled={isRunning}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-medium rounded-lg text-sm transition-colors"
                >
                  {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                  {isRunning ? "Đang chạy..." : "Compile & Run"}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Code Editor Area */}
            <div className="flex-1 min-h-0 flex flex-col">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                className="w-full flex-1 p-4 font-mono text-sm leading-relaxed bg-[#0d1117] text-[#c9d1d9] resize-none focus:outline-none placeholder-slate-600"
                placeholder="// Hãy tự do viết mã C# tại đây..."
              />
            </div>

            {/* Output Console */}
            <div className="h-1/3 min-h-[150px] flex flex-col border-t border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-300">
              <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-800 bg-slate-950/50 shrink-0">
                <Terminal className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-mono font-medium text-slate-400">Terminal Console</span>
              </div>
              <div className="flex-1 p-4 font-mono text-sm overflow-y-auto whitespace-pre-wrap">
                {runOutput ? (
                  runOutput.HasCompilationErrors || runOutput.HasErrors ? (
                    <span className="text-red-400">
                      {runOutput.ErrorMessage || runOutput.ConsoleOutput || "Có lỗi xảy ra khi biên dịch hoặc thực thi."}
                    </span>
                  ) : (
                    <span className="text-emerald-400">
                      {runOutput.ConsoleOutput || "Chương trình chạy nhưng không có output nào."}
                    </span>
                  )
                ) : (
                  <span className="text-slate-600">Nhấn Compile & Run để bắt đầu.</span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
