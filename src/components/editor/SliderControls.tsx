'use client';

import React from 'react';

type Props = { granularity: number; threshold: number; onGranularityChange: (v: number) => void; onThresholdChange: (v: number) => void };

export default function SliderControls({ granularity, threshold, onGranularityChange, onThresholdChange }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-semibold text-[#2D3436] block mb-1.5">⚙️ 精细度 <span className="text-[#FF6B9D]">{granularity}</span></label>
        <input type="range" min={20} max={200} value={granularity} onChange={e => onGranularityChange(Number(e.target.value))}
          className="w-full accent-[#FF6B9D] h-2 rounded-full" />
      </div>
      <div>
        <label className="text-sm font-semibold text-[#2D3436] block mb-1.5">🎯 颜色合并 <span className="text-[#4ECDC4]">{threshold}</span></label>
        <input type="range" min={0} max={50} value={threshold} onChange={e => onThresholdChange(Number(e.target.value))}
          className="w-full accent-[#4ECDC4] h-2 rounded-full" />
      </div>
    </div>
  );
}
