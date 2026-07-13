import React from 'react';
import { GridDimensions } from '@/types/pixelation';

export default function StatusBar({ colorCount, totalBeadCount, gridDimensions }: {
  colorCount: number; totalBeadCount: number; gridDimensions: GridDimensions | null;
}) {
  return (
    <div className="flex items-center gap-6 px-4 py-2 bg-white/80 backdrop-blur-sm border-t border-pink-100 text-sm text-[#2D3436]/60">
      <span>🎨 颜色: <strong className="text-[#2D3436]">{colorCount}</strong> 种</span>
      <span>🧮 总粒数: <strong className="text-[#2D3436]">{totalBeadCount}</strong></span>
      {gridDimensions && <span>📐 画布: <strong className="text-[#2D3436]">{gridDimensions.N}×{gridDimensions.M}</strong></span>}
    </div>
  );
}
