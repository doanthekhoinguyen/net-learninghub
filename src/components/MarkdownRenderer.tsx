import React, { type ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { Link2 } from 'lucide-react';
import { CodeBlock } from '@/components/CodeBlock';
import { cn } from '@/lib/utils';
import type { Components } from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
  theme?: 'light' | 'dark';
  className?: string;
}

// Map special Vietnamese section headers to box styles
function getSectionBoxType(heading: string): string | null {
  const h = heading.toLowerCase().trim();
  if (h === '## mục tiêu' || h === '## mục tiêu bài học') return 'goal';
  if (h === '## tài liệu tham khảo' || h === '## tài liệu') return 'reference';
  if (h === '## bài tập') return 'exercise';
  if (h === '## thử nghiệm') return 'experiment';
  if (h === '## kết luận') return 'conclusion';
  if (h === '## nội dung') return 'content';
  return null;
}

const sectionBoxStyles: Record<string, string> = {
  goal: 'border-l-4 border-purple-500 bg-purple-50 dark:bg-purple-950/30',
  reference: 'border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/30',
  exercise: 'border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-950/30',
  experiment: 'border-l-4 border-sky-500 bg-sky-50 dark:bg-sky-950/30',
  conclusion: 'border-l-4 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30',
  content: 'border-l-4 border-slate-400 bg-slate-50 dark:bg-slate-800/50',
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function MarkdownRenderer({ content, theme = 'light', className }: MarkdownRendererProps) {
  const components: Components = {
    // Headings with anchor links
    h1({ children, ...props }) {
      const id = slugify(String(children));
      return (
        <h1 id={id} className="group flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4 scroll-mt-20" {...props}>
          <a href={`#${id}`} className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Link2 className="w-4 h-4 inline" />
          </a>
          {children}
        </h1>
      );
    },
    h2({ children, ...props }) {
      const text = String(children);
      const id = slugify(text);
      const boxType = getSectionBoxType(text);

      if (boxType) {
        return (
          <SectionBox type={boxType}>
            <h2 id={id} className="group flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white scroll-mt-20" {...props}>
              <a href={`#${id}`} className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Link2 className="w-4 h-4 inline" />
              </a>
              {children}
            </h2>
          </SectionBox>
        );
      }

      return (
        <h2 id={id} className="group flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white mt-8 mb-3 scroll-mt-20" {...props}>
          <a href={`#${id}`} className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Link2 className="w-4 h-4 inline" />
          </a>
          {children}
        </h2>
      );
    },
    h3({ children, ...props }) {
      const id = slugify(String(children));
      return (
        <h3 id={id} className="group flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white mt-6 mb-2 scroll-mt-20" {...props}>
          <a href={`#${id}`} className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Link2 className="w-4 h-4 inline" />
          </a>
          {children}
        </h3>
      );
    },

    // Inline code
    code({ node, className: codeClass, children, ...props }) {
      const match = /language-(\w+)/.exec(codeClass || '');
      const isBlock = (node as { tagName?: string })?.tagName === 'code' || !!(codeClass ?? '').includes('language-');

      if (isBlock || match) {
        return (
          <CodeBlock
            code={String(children).replace(/\n$/, '')}
            language={match ? match[1] : undefined}
          />
        );
      }

      return (
        <code
          className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-primary-600 dark:text-primary-400 text-sm font-mono border border-slate-200 dark:border-slate-700"
          {...props}
        >
          {children}
        </code>
      );
    },

    // Links - external get new tab
    a({ href, children, ...props }) {
      const isExternal = href?.startsWith('http');
      return (
        <a
          href={href}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          className="text-primary-600 dark:text-primary-400 hover:underline"
          {...props}
        >
          {children}
        </a>
      );
    },

    // Lists
    ul({ children, ...props }) {
      return <ul className="list-disc list-outside ml-6 my-2 space-y-1 text-slate-700 dark:text-slate-300" {...props}>{children}</ul>;
    },
    ol({ children, ...props }) {
      return <ol className="list-decimal list-outside ml-6 my-2 space-y-1 text-slate-700 dark:text-slate-300" {...props}>{children}</ol>;
    },
    li({ children, ...props }) {
      return <li className="text-slate-700 dark:text-slate-300 leading-relaxed" {...props}>{children}</li>;
    },

    // Tables
    table({ children, ...props }) {
      return (
        <div className="overflow-x-auto my-4 rounded-lg border border-slate-200 dark:border-slate-700">
          <table className="w-full text-sm" {...props}>{children}</table>
        </div>
      );
    },
    thead({ children, ...props }) {
      return <thead className="bg-slate-50 dark:bg-slate-800" {...props}>{children}</thead>;
    },
    th({ children, ...props }) {
      return <th className="px-4 py-2 text-left font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700" {...props}>{children}</th>;
    },
    td({ children, ...props }) {
      return <td className="px-4 py-2 text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800" {...props}>{children}</td>;
    },

    // Paragraphs
    p({ children, ...props }) {
      return <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4" {...props}>{children}</p>;
    },

    // Blockquotes
    blockquote({ children, ...props }) {
      return (
        <blockquote
          className="border-l-4 border-primary-300 dark:border-primary-700 pl-4 my-4 italic text-slate-600 dark:text-slate-400"
          {...props}
        >
          {children}
        </blockquote>
      );
    },

    // Horizontal rules
    hr({ ...props }) {
      return <hr className="my-8 border-slate-200 dark:border-slate-700" {...props} />;
    },

    // Strong + em
    strong({ children, ...props }) {
      return <strong className="font-semibold text-slate-900 dark:text-white" {...props}>{children}</strong>;
    },
  };

  return (
    <div className={cn('markdown-content', className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

// Section box wrapper for special headings
function SectionBox({ type, children }: { type: string; children: ReactNode }) {
  return (
    <div className={cn('rounded-lg px-4 py-3 my-4', sectionBoxStyles[type] ?? '')}>
      {children}
    </div>
  );
}
