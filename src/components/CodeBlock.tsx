'use client';

import { useState, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { Clipboard, Check, Play, Terminal, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { highlightCode } from '@/lib/shiki';

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

interface RunResult {
  ConsoleOutput?: string;
  HasCompilationErrors?: boolean;
  HasErrors?: boolean;
  ErrorMessage?: string;
}

export function CodeBlock({ code, language, className }: CodeBlockProps) {
  const { resolvedTheme } = useTheme();
  const [copied, setCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [runOutput, setRunOutput] = useState<RunResult | null>(null);

  const isDark = resolvedTheme === 'dark';
  const highlighted = highlightCode(code, language ?? 'plaintext');

  const isCSharp = !language || language.toLowerCase() === 'csharp' || language.toLowerCase() === 'cs' || language.toLowerCase() === 'plaintext';

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

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
      setRunOutput({ HasErrors: true, ErrorMessage: 'Lỗi khi gọi tới máy chủ biên dịch: ' + err.message });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className={cn('group relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 my-4', className)}>
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          {language || 'code'}
        </span>
        <div className="flex items-center gap-2">
          {isCSharp && (
            <button
              onClick={handleRunCode}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-white rounded-md text-xs transition-all duration-200"
              aria-label="Run Code"
            >
              {isRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span className="font-medium">{isRunning ? 'Đang chạy...' : 'Chạy code'}</span>
            </button>
          )}
          <button
            onClick={handleCopy}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-200',
              'hover:bg-slate-200 dark:hover:bg-slate-700',
              copied
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-slate-500 dark:text-slate-400'
            )}
            aria-label="Copy code"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Đã lưu</span>
              </>
            ) : (
              <>
                <Clipboard className="w-3.5 h-3.5" />
                <span>Sao chép</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code content */}
      <div className="relative overflow-x-auto bg-white dark:bg-[#0d1117]">
        <pre className="p-4 text-sm font-mono leading-relaxed overflow-x-auto">
          <code
            className={cn(
              'bg-transparent',
              // Theme-aware text colors via CSS class
              isDark ? '[_:not(.hljs)]&:not(pre_)]&:where(code.hljs)' : '',
            )}
            dangerouslySetInnerHTML={{ __html: highlighted }}
            style={{
              color: isDark ? '#c9d1d9' : '#24292e',
            }}
          />
        </pre>
      </div>

      {/* Output Console */}
      {runOutput && (
        <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-900 text-slate-300">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-800 bg-slate-950">
            <Terminal className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-mono font-medium text-slate-400">Kết quả chạy (Console)</span>
          </div>
          <div className="p-4 font-mono text-sm max-h-60 overflow-y-auto whitespace-pre-wrap">
            {runOutput.HasCompilationErrors || runOutput.HasErrors ? (
              <span className="text-red-400">
                {runOutput.ErrorMessage || runOutput.ConsoleOutput || "Có lỗi xảy ra khi biên dịch hoặc thực thi."}
              </span>
            ) : (
              <span className="text-emerald-400">
                {runOutput.ConsoleOutput || "Chương trình chạy nhưng không có output nào."}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
