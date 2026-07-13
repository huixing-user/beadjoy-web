'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });

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

  // Zoom with mouse wheel
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    setZoom(prev => Math.min(5, Math.max(0.3, prev + delta)));
  }, []);

  // Pan with mouse drag (right-click or Ctrl+left-click)
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || e.ctrlKey || e.metaKey) {
      setIsPanning(true);
      panStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    }
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setPan({ x: e.clientX - panStart.current.x, y: e.clientY - panStart.current.y });
      return;
    }
    // Cell hover
    if (!onCellHover || !gridDimensions) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const scaleX = (gridDimensions.N * cellSize * zoom) / rect.width;
    const scaleY = (gridDimensions.M * cellSize * zoom) / rect.height;
    const col = Math.floor((e.clientX - rect.left - pan.x) * scaleX / (cellSize * zoom));
    const row = Math.floor((e.clientY - rect.top - pan.y) * scaleY / (cellSize * zoom));
    if (row >= 0 && row < gridDimensions.M && col >= 0 && col < gridDimensions.N) {
      onCellHover(row, col);
    }
  }, [isPanning, onCellHover, gridDimensions, cellSize, zoom, pan]);

  const handleMouseUp = useCallback(() => setIsPanning(false), []);

  const getCell = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect || !gridDimensions) return null;
    const scaleX = (gridDimensions.N * cellSize * zoom) / rect.width;
    const scaleY = (gridDimensions.M * cellSize * zoom) / rect.height;
    const col = Math.floor((e.clientX - rect.left - pan.x) * scaleX / (cellSize * zoom));
    const row = Math.floor((e.clientY - rect.top - pan.y) * scaleY / (cellSize * zoom));
    if (row >= 0 && row < gridDimensions.M && col >= 0 && col < gridDimensions.N) return { row, col };
    return null;
  };

  return (
    <div ref={containerRef} className="flex-1 flex items-center justify-center overflow-hidden p-4"
      onWheel={handleWheel} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      {mappedPixelData ? (
        <canvas ref={canvasRef}
          onClick={e => { if (!isPanning) { const c = getCell(e); if (c && mode === 'manual') onPixelClick?.(c.row, c.col); } }}
          className="rounded-xl shadow-md shadow-pink-100/50 cursor-crosshair"
          style={{
            imageRendering: 'pixelated',
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            transformOrigin: 'center center',
            transition: isPanning ? 'none' : 'transform 0.1s ease-out',
          }}
        />
      ) : (
        <div className="text-[#2D3436]/30 text-center">
          <span className="text-6xl block mb-4">🎨</span>
          <p className="text-lg">上传图片开始创作</p>
        </div>
      )}
      {/* Zoom controls */}
      {mappedPixelData && (
        <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-white/90 rounded-xl shadow-md px-2 py-1">
          <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-pink-50 text-sm" onClick={() => setZoom(z => Math.min(5, z + 0.2))}>🔍+</button>
          <span className="text-xs text-[#2D3436]/50 w-12 text-center">{Math.round(zoom * 100)}%</span>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-pink-50 text-sm" onClick={() => setZoom(z => Math.max(0.3, z - 0.2))}>🔍-</button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-pink-50 text-sm" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}>↺</button>
        </div>
      )}
    </div>
  );
}
