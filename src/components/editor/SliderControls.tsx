'use client';

import React, { useState, useEffect } from 'react';

type Props = {
  granularity: number; threshold: number; maxW: number; maxH: number;
  onGranularityChange: (v: number) => void; onThresholdChange: (v: number) => void;
  onMaxWChange: (v: number) => void; onMaxHChange: (v: number) => void;
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
        // Allow empty or digits-only during editing
        if (raw === '' || /^\d*$/.test(raw)) setText(raw);
      }}
      onBlur={commit}
      onKeyDown={e => { if (e.key === 'Enter') commit(); }}
      className={`text-center text-xs border border-gray-200 rounded-lg px-1 py-1.5 focus:border-[#FF6B9D] outline-none ${className || ''}`}
    />
  );
}

export default function SliderControls({ granularity, threshold, maxW, maxH, onGranularityChange, onThresholdChange, onMaxWChange, onMaxHChange }: Props) {
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

      {/* Canvas size */}
      <div>
        <label className="text-sm font-semibold text-[#2D3436] block mb-1.5">📐 画布尺寸 (宽×高)</label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="flex items-center gap-1">
              <IntInput value={maxW} min={10} max={500} onChange={onMaxWChange} className="w-full" />
              <span className="text-xs text-[#2D3436]/40">宽</span>
            </div>
            <input type="range" min={10} max={500} value={maxW}
              onChange={e => onMaxWChange(Number(e.target.value))}
              className="w-full accent-[#C3B1E1] h-1.5 rounded-full cursor-pointer mt-1" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <IntInput value={maxH} min={10} max={500} onChange={onMaxHChange} className="w-full" />
              <span className="text-xs text-[#2D3436]/40">高</span>
            </div>
            <input type="range" min={10} max={500} value={maxH}
              onChange={e => onMaxHChange(Number(e.target.value))}
              className="w-full accent-[#C3B1E1] h-1.5 rounded-full cursor-pointer mt-1" />
          </div>
        </div>
        <p className="text-[10px] text-[#2D3436]/30 mt-0.5">限制格子数上限，适合不同店铺的画布</p>
      </div>
    </div>
  );
}
