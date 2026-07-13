'use client';

import React from 'react';
import { EditorMode } from '@/types/pixelation';

export default function LeftToolbar({ mode }: { mode: EditorMode }) {
  const tools = [
    { emoji: '🖌️', label: '画笔', active: mode === 'manual' },
    { emoji: '🧹', label: '橡皮', active: mode === 'manual' },
    { emoji: '🔍', label: '放大', active: true },
    { emoji: '↩️', label: '撤销', active: mode === 'manual' },
    { emoji: '↪️', label: '重做', active: mode === 'manual' },
  ];
  return (
    <div className="flex flex-col items-center gap-3 p-3 bg-white rounded-2xl shadow-md shadow-pink-100/50">
      {tools.map(t => (
        <button key={t.label} disabled={!t.active} title={t.label}
          className={`w-10 h-10 flex items-center justify-center rounded-xl text-lg transition-all duration-200 ${
            t.active ? 'hover:bg-pink-50 hover:scale-110 cursor-pointer' : 'opacity-30 cursor-not-allowed'
          }`}>
          {t.emoji}
        </button>
      ))}
    </div>
  );
}
