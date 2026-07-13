'use client';

import React from 'react';
import { ColorCount } from '@/types/pixelation';

type Props = { colorCounts: Record<string, ColorCount> | null; excludedColors: Set<string>; onToggleExclude: (hex: string) => void };

export default function ColorStatsPanel({ colorCounts, excludedColors, onToggleExclude }: Props) {
  if (!colorCounts) return null;
  const entries = Object.entries(colorCounts).sort(([, a], [, b]) => b.count - a.count);

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-[#2D3436]">📊 颜色统计 ({entries.length}种)</h3>
      <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
        {entries.map(([hex, { count, color }]) => {
          const isExcluded = excludedColors.has(hex);
          return (
            <button key={hex} onClick={() => onToggleExclude(hex)}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-xl text-xs transition-all ${isExcluded ? 'opacity-30 line-through' : 'hover:bg-pink-50'}`}>
              <span className="w-5 h-5 rounded-md border border-gray-200 flex-shrink-0" style={{ backgroundColor: color }} />
              <span className="text-[#2D3436]/70 truncate flex-1 text-left">{hex}</span>
              <span className="text-[#2D3436]/40 tabular-nums">{count}粒</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
