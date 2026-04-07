'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export function SelectionTooltip() {
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState('');

  useEffect(() => {
    const handleMouseUp = () => {
      setTimeout(() => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
          setShow(false);
          return;
        }

        const text = selection.toString().trim();
        // Chỉ hiện khi bôi đen đủ dài (khỏi hiện linh tinh)
        if (text.length > 5) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          
          setPosition({
            x: rect.left + rect.width / 2,
            y: rect.top + window.scrollY - 10,
          });
          setSelectedText(text);
          setShow(true);
        } else {
          setShow(false);
        }
      }, 0);
    };

    const handleSelectionChange = () => {
      const selection = window.getSelection();
      // Tắt tooltip nếu người dùng click chỗ khác làm mất vùng bôi đen
      if (!selection || selection.isCollapsed) {
        setShow(false);
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('selectionchange', handleSelectionChange);

    // Xử lý scroll để tooltip di chuyển mượt hoặc tắt đi (tại đây chọn cách tắt đi cho đỡ rác UI)
    const handleScroll = () => setShow(false);
    document.addEventListener('scroll', handleScroll, true);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('scroll', handleScroll, true);
    };
  }, []);

  const handleClick = () => {
    // Kích hoạt sự kiện để AIAssistant bắt
    window.dispatchEvent(
      new CustomEvent('nlh-ask-ai', { detail: { text: selectedText } })
    );
    setShow(false);
    window.getSelection()?.removeAllRanges(); // bỏ bôi đen
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          style={{
            position: 'absolute',
            left: position.x,
            top: position.y,
            transform: 'translate(-50%, -100%)',
            zIndex: 9999, // global overlay
          }}
          className="pointer-events-auto"
        >
          <button
            onMouseDown={(e) => {
              // Ngăn tự động tắt vùng bôi đen khi click vào nút này
              e.preventDefault();
              e.stopPropagation();
            }}
            onClick={handleClick}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-white text-xs font-medium rounded-lg shadow-xl hover:shadow-primary-500/20 transition-all whitespace-nowrap cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary-400" />
            Hỏi AI giải thích
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
