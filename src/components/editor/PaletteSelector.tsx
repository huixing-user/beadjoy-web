'use client';

import React from 'react';
import { ColorSystem } from '@/types/pixelation';

type Props = { selectedSystem: ColorSystem; paletteSize: number; onSystemChange: (s: ColorSystem) => void; onSizeChange: (s: number) => void };

const SYSTEMS: { key: ColorSystem; name: string }[] = [
  { key: 'MARD', name: 'MARD' }, { key: 'COCO', name: 'COCO' }, { key: '漫漫', name: '漫漫' }, { key: '盼盼', name: '盼盼' }, { key: '咪小窝', name: '咪小窝' },
];
const SIZES = [168, 144, 96, 72, 48];

export default function PaletteSelector({ selectedSystem, paletteSize, onSystemChange, onSizeChange }: Props) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-[#2D3436]">🎨 色板设置</h3>
      <select value={selectedSystem} onChange={e => onSystemChange(e.target.value as ColorSystem)}
        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm bg-white focus:border-[#FF6B9D] focus:ring-2 focus:ring-pink-100 outline-none">
        {SYSTEMS.map(s => <option key={s.key} value={s.key}>{s.name}</option>)}
      </select>
      <select value={paletteSize} onChange={e => onSizeChange(Number(e.target.value))}
        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm bg-white focus:border-[#FF6B9D] focus:ring-2 focus:ring-pink-100 outline-none">
        {SIZES.map(s => <option key={s} value={s}>{s}色</option>)}
      </select>
    </div>
  );
}
