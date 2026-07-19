'use client';

import React, { useState, useEffect } from 'react';

type Props = {
  granularity: number; threshold: number;
  maxW: number; maxH: number;
  gridN: number; gridM: number;
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
        if (raw === '' || /^\d*$/.test(raw)) setText(raw);
      }}
      onBlur={commit}
      onKeyDown={e => { if (e.key === 'Enter') commit(); }}
      className={`text-center text-xs border border-gray-200 rounded-lg px-0 py-1.5 focus:border-[#FF6B9D] outline-none ${className || ''}`}
    />
  );
}

export default function SliderControls({
  granularity, threshold, maxW, maxH, gridN, gridM,
  onGranularityChange, onThresholdChange, onMaxWChange, onMaxHChange,
}: Props) {
  return (
    <div className="space-y-3 text-[11px]">
      {/* Granularity */}
      <div>
        <label className="font-semibold text-[#2D3436] block mb-1">⚙️ 精细度</label>
        <div className="flex items-center gap-1.5">
          <input type="range" min={10} max={500} value={granularity}
            onChange={e => onGranularityChange(Number(e.target.value))}
            className="flex-1 accent-[#FF6B9D] h-1.5 rounded-full cursor-pointer" />
          <IntInput value={granularity} min={10} max={500} onChange={onGranularityChange} className="w-14" />
        </div>
      </div>

      {/* Threshold */}
      <div>
        <label className="font-semibold text-[#2D3436] block mb-1">🎯 颜色合并</label>
        <div className="flex items-center gap-1.5">
          <input type="range" min={0} max={100} value={threshold}
            onChange={e => onThresholdChange(Number(e.target.value))}
            className="flex-1 accent-[#4ECDC4] h-1.5 rounded-full cursor-pointer" />
          <IntInput value={threshold} min={0} max={100} onChange={onThresholdChange} className="w-12" />
        </div>
      </div>

      {/* Canvas size */}
      <div>
        <label className="font-semibold text-[#2D3436] block mb-1">📐 画布尺寸 (宽×高)</label>
        <div className="grid grid-cols-2 gap-1.5">
          <div className="flex items-center gap-1">
            <span className="text-[#2D3436]/40 w-4">W</span>
            <IntInput value={maxW} min={10} max={500} onChange={onMaxWChange} className="flex-1" />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[#2D3436]/40 w-4">H</span>
            <IntInput value={maxH} min={10} max={500} onChange={onMaxHChange} className="flex-1" />
          </div>
        </div>
        <p className="text-[#2D3436]/30 mt-0.5">格子数上限</p>
      </div>

      {/* Current grid */}
      <div className="bg-gray-50 rounded-lg px-2 py-1.5">
        <p className="text-[#2D3436]/50">
          当前: <span className="font-semibold text-[#2D3436]">{gridN}×{gridM}</span> 格
        </p>
      </div>
    </div>
  );
}
