'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { MappedPixel, GridDimensions, EditorMode } from '@/types/pixelation';

type Props = {
  mappedPixelData: MappedPixel[][] | null; gridDimensions: GridDimensions | null;
  mode: EditorMode; cellSize?: number;
  onPixelClick?: (row: number, col: number) => void;
  hoveredCell?: { row: number; col: number } | null;
  onCellHover?: (row: number, col: number) => void;
};

export default function CanvasPreview({ mappedPixelData, gridDimensions, mode, cellSize = 8, onPixelClick, hoveredCell, onCellHover }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !mappedPixelData || !gridDimensions) return;
    const { N, M } = gridDimensions;
    canvas.width = N * cellSize;
    canvas.height = M * cellSize;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    for (let j = 0; j < M; j++) {
      for (let i = 0; i < N; i++) {
        const cell = mappedPixelData[j]?.[i];
        const x = i * cellSize, y = j * cellSize;
        ctx.fillStyle = cell?.isExternal ? '#f0f0f0' : (cell?.color || '#FFFFFF');
        ctx.fillRect(x, y, cellSize, cellSize);
      }
    }

    ctx.strokeStyle = '#e5e5e5'; ctx.lineWidth = 0.5;
    for (let j = 0; j <= M; j++) { ctx.beginPath(); ctx.moveTo(0, j * cellSize); ctx.lineTo(N * cellSize, j * cellSize); ctx.stroke(); }
    for (let i = 0; i <= N; i++) { ctx.beginPath(); ctx.moveTo(i * cellSize, 0); ctx.lineTo(i * cellSize, M * cellSize); ctx.stroke(); }

    if (hoveredCell && mode === 'manual') {
      ctx.strokeStyle = '#FF6B9D'; ctx.lineWidth = 2;
      ctx.strokeRect(hoveredCell.col * cellSize, hoveredCell.row * cellSize, cellSize, cellSize);
    }
  }, [mappedPixelData, gridDimensions, cellSize, hoveredCell, mode]);

  useEffect(() => { draw(); }, [draw]);

  const getCell = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect || !gridDimensions) return null;
    const scaleX = (gridDimensions.N * cellSize) / rect.width;
    const scaleY = (gridDimensions.M * cellSize) / rect.height;
    const col = Math.floor((e.clientX - rect.left) * scaleX / cellSize);
    const row = Math.floor((e.clientY - rect.top) * scaleY / cellSize);
    if (row >= 0 && row < gridDimensions.M && col >= 0 && col < gridDimensions.N) return { row, col };
    return null;
  };

  return (
    <div className="flex-1 flex items-center justify-center overflow-auto p-4">
      {mappedPixelData ? (
        <canvas ref={canvasRef}
          onClick={e => { const c = getCell(e); if (c && mode === 'manual') onPixelClick?.(c.row, c.col); }}
          onMouseMove={e => { const c = getCell(e); if (c) onCellHover?.(c.row, c.col); }}
          className="max-w-full max-h-full rounded-xl shadow-md shadow-pink-100/50 cursor-crosshair"
          style={{ imageRendering: 'pixelated' }}
        />
      ) : (
        <div className="text-[#2D3436]/30 text-center">
          <span className="text-6xl block mb-4">🎨</span>
          <p className="text-lg">上传图片开始创作</p>
        </div>
      )}
    </div>
  );
}
