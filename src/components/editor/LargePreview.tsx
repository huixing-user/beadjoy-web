'use client';

import React, { useRef, useEffect, useState } from 'react';
import { MappedPixel, GridDimensions } from '@/types/pixelation';

type Props = {
  mappedPixelData: MappedPixel[][] | null;
  gridDimensions: GridDimensions | null;
  cellSize?: number;
};

function drawBeads(
  canvas: HTMLCanvasElement,
  mappedPixelData: MappedPixel[][],
  gridDimensions: GridDimensions,
  cellSize: number,
) {
  const { N, M } = gridDimensions;
  const cs = cellSize;
  const gap = Math.max(1, Math.floor(cs * 0.12));
  const radius = Math.floor(cs * 0.3);

  canvas.width = N * (cs + gap) + gap;
  canvas.height = M * (cs + gap) + gap;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let j = 0; j < M; j++) {
    for (let i = 0; i < N; i++) {
      const cell = mappedPixelData[j]?.[i];
      const x = gap + i * (cs + gap);
      const y = gap + j * (cs + gap);

      if (cell?.isExternal) {
        ctx.fillStyle = '#e0e0e0';
        ctx.beginPath();
        ctx.roundRect(x, y, cs, cs, radius);
        ctx.fill();
        continue;
      }

      const color = cell?.color || '#FFFFFF';

      // Main body
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(x, y, cs, cs, radius);
      ctx.fill();

      // Gradient overlay for 3D effect
      const g = ctx.createLinearGradient(x, y, x + cs, y + cs);
      g.addColorStop(0, 'rgba(255,255,255,0.4)');
      g.addColorStop(0.4, 'rgba(255,255,255,0.05)');
      g.addColorStop(1, 'rgba(0,0,0,0.18)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.roundRect(x, y, cs, cs, radius);
      ctx.fill();

      // Highlight dot
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.beginPath();
      const dotR = Math.max(1.2, cs * 0.1);
      ctx.arc(x + cs * 0.32, y + cs * 0.32, dotR, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function PreviewContent({ mappedPixelData, gridDimensions, cellSize = 20 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !mappedPixelData || !gridDimensions) return;
    drawBeads(canvas, mappedPixelData, gridDimensions, cellSize);
  }, [mappedPixelData, gridDimensions, cellSize]);

  if (!mappedPixelData || !gridDimensions) {
    return (
      <div className="flex items-center justify-center h-32 text-[#2D3436]/30 text-sm">
        <span>处理图片后预览</span>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className="max-w-full cursor-pointer hover:scale-[1.02] transition-transform"
      style={{ imageRendering: 'auto' }}
    />
  );
}

export default function LargePreview({ mappedPixelData, gridDimensions, cellSize = 20 }: Props) {
  const [expanded, setExpanded] = useState(false);
  const modalCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (expanded && modalCanvasRef.current && mappedPixelData && gridDimensions) {
      const largerCellSize = Math.max(8, Math.min(30, Math.floor(600 / gridDimensions.N)));
      drawBeads(modalCanvasRef.current, mappedPixelData, gridDimensions, largerCellSize);
    }
  }, [expanded, mappedPixelData, gridDimensions]);

  return (
    <>
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-[#2D3436]">🔮 拼豆效果预览</h3>
        <div
          className="overflow-auto max-h-[260px] rounded-2xl border border-gray-100 bg-[#f0f0f0] p-2 cursor-pointer"
          onClick={() => setExpanded(true)}
          title="点击放大预览"
        >
          <PreviewContent mappedPixelData={mappedPixelData} gridDimensions={gridDimensions} cellSize={14} />
        </div>
        <p className="text-[10px] text-[#2D3436]/30 text-center">点击预览图可放大查看</p>
      </div>

      {/* Expanded modal */}
      {expanded && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setExpanded(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 max-w-[90vw] max-h-[90vh] overflow-auto shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#2D3436]">🔮 拼豆效果预览</h2>
              <button
                onClick={() => setExpanded(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-sm"
              >
                ✕
              </button>
            </div>
            <canvas ref={modalCanvasRef} className="max-w-full" style={{ imageRendering: 'auto' }} />
            {mappedPixelData && gridDimensions && (
              <p className="text-xs text-[#2D3436]/40 mt-3 text-center">
                {gridDimensions.N}×{gridDimensions.M} · {mappedPixelData[0]?.length || 0}列
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
