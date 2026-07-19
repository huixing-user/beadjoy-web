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
      <div>
        <label className="text-sm font-semibold text-[#2D3436] block mb-1.5">⚙️ 精细度 <span className="text-[#FF6B9D]">{granularity}</span></label>
        <input type="range" min={10} max={200} value={granularity}
          onChange={e => onGranularityChange(Number(e.target.value))}
          className="w-full accent-[#FF6B9D] h-2 rounded-full cursor-pointer" />
        <div className="flex justify-between text-[10px] text-[#2D3436]/30 mt-0.5"><span>10</span><span>200</span></div>
      </div>
      <div>
        <label className="text-sm font-semibold text-[#2D3436] block mb-1.5">🎯 颜色合并 <span className="text-[#4ECDC4]">{threshold}</span></label>
        <input type="range" min={0} max={100} value={threshold}
          onChange={e => onThresholdChange(Number(e.target.value))}
          className="w-full accent-[#4ECDC4] h-2 rounded-full cursor-pointer" />
        <div className="flex justify-between text-[10px] text-[#2D3436]/30 mt-0.5"><span>0 (不合并)</span><span>100</span></div>
      </div>
      <div>
        <label className="text-sm font-semibold text-[#2D3436] block mb-1.5">📐 最大画布 <span className="text-[#C3B1E1]">{maxGrid}</span> 格</label>
        <input type="range" min={20} max={300} value={maxGrid}
          onChange={e => onMaxGridChange(Number(e.target.value))}
          className="w-full accent-[#C3B1E1] h-2 rounded-full cursor-pointer" />
        <div className="flex justify-between text-[10px] text-[#2D3436]/30 mt-0.5"><span>20 (小)</span><span>300 (大)</span></div>
        <p className="text-[10px] text-[#2D3436]/30 mt-0.5">限制宽边格子数上限，适合小画布</p>
      </div>
    </div>
  );
}
