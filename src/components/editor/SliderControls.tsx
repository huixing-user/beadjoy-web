'use client';

import React from 'react';

type Props = {
  granularity: number; threshold: number; maxGrid: number;
  onGranularityChange: (v: number) => void; onThresholdChange: (v: number) => void;
  onMaxGridChange: (v: number) => void;
};

export default function SliderControls({ granularity, threshold, maxGrid, onGranularityChange, onThresholdChange, onMaxGridChange }: Props) {
  return (
    <div className="space-y-4">
      {/* Granularity */}
      <div>
        <label className="text-sm font-semibold text-[#2D3436] block mb-1.5">⚙️ 精细度</label>
        <div className="flex items-center gap-2">
          <input type="range" min={10} max={200} value={granularity}
            onChange={e => onGranularityChange(Number(e.target.value))}
            className="flex-1 accent-[#FF6B9D] h-2 rounded-full cursor-pointer" />
          <input type="number" min={10} max={200} value={granularity}
            onChange={e => { const v = Number(e.target.value); if (v >= 10 && v <= 200) onGranularityChange(v); }}
            className="w-16 text-center text-xs border border-gray-200 rounded-lg px-1 py-1.5 focus:border-[#FF6B9D] outline-none" />
        </div>
      </div>

      {/* Threshold */}
      <div>
        <label className="text-sm font-semibold text-[#2D3436] block mb-1.5">🎯 颜色合并</label>
        <div className="flex items-center gap-2">
          <input type="range" min={0} max={100} value={threshold}
            onChange={e => onThresholdChange(Number(e.target.value))}
            className="flex-1 accent-[#4ECDC4] h-2 rounded-full cursor-pointer" />
          <input type="number" min={0} max={100} value={threshold}
            onChange={e => { const v = Number(e.target.value); if (v >= 0 && v <= 100) onThresholdChange(v); }}
            className="w-16 text-center text-xs border border-gray-200 rounded-lg px-1 py-1.5 focus:border-[#4ECDC4] outline-none" />
        </div>
        <div className="flex justify-between text-[10px] text-[#2D3436]/30 mt-0.5"><span>0</span><span>100</span></div>
      </div>

      {/* Max Grid */}
      <div>
        <label className="text-sm font-semibold text-[#2D3436] block mb-1.5">📐 最大画布</label>
        <div className="flex items-center gap-2">
          <input type="range" min={20} max={300} value={maxGrid}
            onChange={e => onMaxGridChange(Number(e.target.value))}
            className="flex-1 accent-[#C3B1E1] h-2 rounded-full cursor-pointer" />
          <input type="number" min={20} max={300} value={maxGrid}
            onChange={e => { const v = Number(e.target.value); if (v >= 20 && v <= 300) onMaxGridChange(v); }}
            className="w-16 text-center text-xs border border-gray-200 rounded-lg px-1 py-1.5 focus:border-[#C3B1E1] outline-none" />
        </div>
        <p className="text-[10px] text-[#2D3436]/30 mt-0.5">限制宽边格子数上限</p>
      </div>
    </div>
  );
}
