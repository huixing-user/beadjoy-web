'use client';

import React, { useState, useEffect } from 'react';

type Props = {
  granularity: number; threshold: number; maxGrid: number;
  gridN: number; gridM: number;
  onGranularityChange: (v: number) => void; onThresholdChange: (v: number) => void;
  onMaxGridChange: (v: number) => void;
};

function IntInput({ value, min, max, onChange, className }: {
  value: number; min: number; max: number; onChange: (v: number) => void; className?: string;
}) {
  const [text, setText] = useState(String(value));
  useEffect(() => { setText(String(value)); }, [value]);

  const commit = () => {
    const n = parseInt(text, 10);
    if (isNaN(n)) { setText(String(value)); return; }
    if (n < min) { onChange(min); setText(String(min)); }
    else if (n > max) { onChange(max); setText(String(max)); }
    else { onChange(n); setText(String(n)); }
  };

  return (
    <input
      value={text}
      onChange={e => {
        const raw = e.target.value;
        if (raw === '' || /^\d*$/.test(raw)) setText(raw);
      }}
      onBlur={commit}
      onKeyDown={e => { if (e.key === 'Enter') commit(); }}
      className={`text-center text-xs border border-gray-200 rounded-lg px-1 py-1.5 focus:border-[#FF6B9D] outline-none ${className || ''}`}
    />
  );
}

export default function SliderControls({ granularity, threshold, maxGrid, gridN, gridM, onGranularityChange, onThresholdChange, onMaxGridChange }: Props) {
  return (
    <div className="space-y-4">
      {/* Granularity */}
      <div>
        <label className="text-sm font-semibold text-[#2D3436] block mb-1.5">⚙️ 精细度</label>
        <div className="flex items-center gap-2">
          <input type="range" min={10} max={300} value={granularity}
            onChange={e => onGranularityChange(Number(e.target.value))}
            className="flex-1 accent-[#FF6B9D] h-2 rounded-full cursor-pointer" />
          <IntInput value={granularity} min={10} max={300} onChange={onGranularityChange} className="w-16" />
        </div>
        <div className="flex justify-between text-[10px] text-[#2D3436]/30 mt-0.5"><span>10</span><span>300</span></div>
      </div>

      {/* Threshold */}
      <div>
        <label className="text-sm font-semibold text-[#2D3436] block mb-1.5">🎯 颜色合并</label>
        <div className="flex items-center gap-2">
          <input type="range" min={0} max={100} value={threshold}
            onChange={e => onThresholdChange(Number(e.target.value))}
            className="flex-1 accent-[#4ECDC4] h-2 rounded-full cursor-pointer" />
          <IntInput value={threshold} min={0} max={100} onChange={onThresholdChange} className="w-14" />
        </div>
        <div className="flex justify-between text-[10px] text-[#2D3436]/30 mt-0.5"><span>0</span><span>100</span></div>
      </div>

      {/* Max Grid */}
      <div>
        <label className="text-sm font-semibold text-[#2D3436] block mb-1.5">📐 最大画布宽度</label>
        <div className="flex items-center gap-2">
          <input type="range" min={10} max={500} value={maxGrid}
            onChange={e => onMaxGridChange(Number(e.target.value))}
            className="flex-1 accent-[#C3B1E1] h-2 rounded-full cursor-pointer" />
          <IntInput value={maxGrid} min={10} max={500} onChange={onMaxGridChange} className="w-16" />
        </div>
        <div className="flex justify-between text-[10px] text-[#2D3436]/30 mt-0.5"><span>10</span><span>500</span></div>
      </div>

      {/* Current grid size (read-only indicator) */}
      <div className="bg-gray-50 rounded-xl px-3 py-2">
        <p className="text-xs text-[#2D3436]/50">
          当前画布: <span className="font-semibold text-[#2D3436]">{gridN}×{gridM}</span> 格
          <span className="block text-[10px] mt-0.5">高度按图片比例自动计算</span>
        </p>
      </div>
    </div>
  );
}
