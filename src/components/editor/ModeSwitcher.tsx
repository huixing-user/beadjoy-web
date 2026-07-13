'use client';

import React from 'react';
import { EditorMode } from '@/types/pixelation';

type Props = { currentMode: EditorMode; onModeChange: (mode: EditorMode) => void };

const MODES: { key: EditorMode; label: string; emoji: string }[] = [
  { key: 'quick', label: '快速', emoji: '🎨' },
  { key: 'ai', label: 'AI优化', emoji: '🤖' },
  { key: 'manual', label: '手动', emoji: '✏️' },
];

export default function ModeSwitcher({ currentMode, onModeChange }: Props) {
  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-2xl p-1">
      {MODES.map(({ key, label, emoji }) => (
        <button key={key} onClick={() => onModeChange(key)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
            currentMode === key ? 'bg-white text-[#FF6B9D] shadow-sm scale-105' : 'text-[#2D3436]/50 hover:text-[#2D3436]/80'
          }`}>
          <span>{emoji}</span><span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}
