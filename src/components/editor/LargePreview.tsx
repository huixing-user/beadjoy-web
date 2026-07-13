'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { MappedPixel, GridDimensions, EditorMode } from '@/types/pixelation';

type Props = {
  mappedPixelData: MappedPixel[][] | null;
  gridDimensions: GridDimensions | null;
  cellSize?: number;
};

/**
 * Large-pixel preview that shows what the finished bead art will look like.
 * Each cell is drawn large with rounded corners and a subtle 3D bead effect.
 */
export default function LargePreview({ mappedPixelData, gridDimensions, cellSize = 20 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !mappedPixelData || !gridDimensions) return;
    const { N, M } = gridDimensions;
    const cs = cellSize;
    const gap = Math.max(1, Math.floor(cs * 0.12)); // gap between beads
    const radius = Math.floor(cs * 0.3); // bead corner radius

    canvas.width = N * (cs + gap) + gap;
    canvas.height = M * (cs + gap) + gap;
    const ctx = canvas.getContext('2d')!;

    // Background
    ctx.fillStyle = '#f8f8f8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let j = 0; j < M; j++) {
      for (let i = 0; i < N; i++) {
        const cell = mappedPixelData[j]?.[i];
        const x = gap + i * (cs + gap);
        const y = gap + j * (cs + gap);

        if (cell?.isExternal) {
          // Draw as faint gray placeholder
          ctx.fillStyle = '#e8e8e8';
          ctx.beginPath();
          ctx.roundRect(x, y, cs, cs, radius);
          ctx.fill();
        } else {
          const color = cell?.color || '#FFFFFF';

          // 3D bead effect: main body
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.roundRect(x, y, cs, cs, radius);
          ctx.fill();

          // Highlight (top-left)
          const hlGrad = ctx.createLinearGradient(x, y, x + cs, y + cs);
          hlGrad.addColorStop(0, 'rgba(255,255,255,0.45)');
          hlGrad.addColorStop(0.5, 'rgba(255,255,255,0.1)');
          hlGrad.addColorStop(1, 'rgba(0,0,0,0.15)');
          ctx.fillStyle = hlGrad;
          ctx.beginPath();
          ctx.roundRect(x, y, cs, cs, radius);
          ctx.fill();

          // Small center highlight dot for bead realism
          ctx.fillStyle = 'rgba(255,255,255,0.3)';
          ctx.beginPath();
          const dotR = Math.max(1.5, cs * 0.12);
          ctx.arc(x + cs * 0.35, y + cs * 0.35, dotR, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }, [mappedPixelData, gridDimensions, cellSize]);

  if (!mappedPixelData || !gridDimensions) {
    return (
      <div className="flex items-center justify-center h-48 text-[#2D3436]/30 text-sm">
        <span>处理图片后预览</span>
      </div>
    );
  }

  return (
    <div className="overflow-auto max-h-[400px] rounded-2xl border border-gray-100 bg-[#f8f8f8] p-2">
      <p className="text-xs text-[#2D3436]/40 mb-2 px-2">🔮 拼豆效果预览</p>
      <canvas
        ref={canvasRef}
        className="max-w-full"
        style={{ imageRendering: 'auto' }}
      />
    </div>
  );
}
