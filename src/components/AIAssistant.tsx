'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, Bot, User, Loader2, ArrowDown } from 'lucide-react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { cn } from '@/lib/utils';
import { CodeBlock } from '@/components/CodeBlock';


interface Message {
  role: 'user' | 'model';
  content: string;
}

export function AIAssistant() {
  const params = useParams();
  const currentSlug = params?.slug ? (Array.isArray(params.slug) ? params.slug.join('/') : params.slug) : '';

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: 'Chào bạn! Mình là AI Trợ lý của khoá học. Bạn cần mình giải đáp khái niệm nào hay đang gặp lỗi code gì ở bài này không?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Cuộn xuống cuối mỗi khi có tin nhắn mới
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // Focus ô nhập khi mở open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Lắng nghe yêu cầu từ SelectionTooltip
  useEffect(() => {
    const handleAskAI = (e: Event) => {
      const customEvent = e as CustomEvent;
      const textToAsk = customEvent.detail?.text;
      if (textToAsk) {
        setIsOpen(true);
        setInput(`Hãy giải thích cho tôi đoạn sau:\n\n"${textToAsk}"`);
        // The user decided: ONLY autofill, wait for user confirmation (Enter).
      }
    };
    window.addEventListener('nlh-ask-ai', handleAskAI);
    return () => window.removeEventListener('nlh-ask-ai', handleAskAI);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, currentSlug })
      });

      if (!response.ok) throw new Error('API request failed');

      // Add a placeholder message for the model
      setMessages((prev) => [...prev, { role: 'model', content: '' }]);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (reader) {
        let aiResponse = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          aiResponse += decoder.decode(value, { stream: true });
          
          // Cập nhật text liên tục (streaming)
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: 'model', content: aiResponse };
            return updated;
          });
        }
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'model', content: '**Lỗi kết nối:** Mình không thể kết nối tới máy chủ AI lúc này. Vui lòng thử lại sau.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const mdComponents: Components = {
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
          className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-primary-600 dark:text-primary-400 text-xs font-mono border border-slate-200 dark:border-slate-700 break-all"
          {...props}
        >
          {children}
        </code>
      );
    },
    p({ children, ...props }) {
      return <p className="mb-2 last:mb-0" {...props}>{children}</p>;
    }
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl bg-gradient-to-br from-indigo-500 to-primary-600 hover:from-indigo-400 hover:to-primary-500 text-white transition-all transform hover:scale-105 active:scale-95 group"
            aria-label="Mở AI Trợ lý"
          >
            <Sparkles className="w-6 h-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-slate-50 dark:border-slate-900" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            style={{ width: 380, height: 600 }}
            className="fixed bottom-6 right-6 z-50 resize min-w-[300px] max-w-[calc(100vw-3rem)] min-h-[400px] max-h-[calc(100vh-3rem)] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-white/20 dark:border-slate-700/50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-500/10 to-primary-500/10 border-b border-white/20 dark:border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-primary-600 flex items-center justify-center shadow-inner">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-white text-sm">Trợ lý AI</h3>
                  <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">Sẵn sàng hỗ trợ bài học</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 mr-1 rounded-full text-slate-500 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
              {messages.map((m, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'flex gap-3 max-w-[90%]',
                    m.role === 'user' ? 'ml-auto flex-row-reverse' : ''
                  )}
                >
                  <div className={cn(
                    'w-7 h-7 shrink-0 rounded-full flex items-center justify-center mt-1 outline outline-2 outline-white/50 dark:outline-slate-800/50',
                    m.role === 'user' ? 'bg-slate-200 dark:bg-slate-700' : 'bg-primary-100 dark:bg-primary-900/50'
                  )}>
                    {m.role === 'user' ? (
                      <User className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                    ) : (
                      <Bot className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                    )}
                  </div>
                  
                  <div className={cn(
                    'px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed break-words min-w-0',
                    m.role === 'user' 
                      ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 rounded-tr-sm'
                      : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 shadow-sm rounded-tl-sm text-slate-700 dark:text-slate-300'
                  )}>
                    {m.role === 'model' ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-pre:my-2 prose-pre:p-2 prose-pre:bg-slate-900 prose-pre:rounded-lg overflow-x-auto w-full">
                        <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={mdComponents}>
                          {m.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      m.content
                    )}
                  </div>
                </motion.div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3 max-w-[90%]">
                  <div className="w-7 h-7 shrink-0 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center mt-1">
                    <Loader2 className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400 animate-spin" />
                  </div>
                  <div className="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 shadow-sm rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} className="h-2" />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
              <form
                onSubmit={handleSubmit}
                className="relative bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-end p-1 border border-slate-200 dark:border-slate-700 focus-within:border-primary-400 transition-colors shadow-sm"
              >
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Hỏi AI về mã nguồn, khái niệm..."
                  className="flex-1 max-h-32 min-h-[44px] bg-transparent resize-none outline-none py-2.5 px-3 text-sm text-slate-800 dark:text-white placeholder-slate-400"
                  rows={1}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-2 mb-1 mr-1 rounded-lg bg-primary-600 hover:bg-primary-500 disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-800 dark:disabled:text-slate-600 text-white transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
