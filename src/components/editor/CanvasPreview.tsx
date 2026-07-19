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
    // Dynamic cellSize: make the canvas fit its container without overflowing
    const containerEl = containerRef.current; // closure captures ref
    // Use requestAnimationFrame to get the actual container size after layout
    const maxW = (containerEl?.clientWidth || 600) - 32;
    const maxH = (containerEl?.clientHeight || 500) - 32;
    const cs = Math.max(2, Math.min(20, Math.floor(Math.min(maxW / N, maxH / M))));
    canvas.width = N * cs;
    canvas.height = M * cs;
    canvas.style.width = `${N * cs * zoom}px`;
    canvas.style.height = `${M * cs * zoom}px`;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    for (let j = 0; j < M; j++) {
      for (let i = 0; i < N; i++) {
        const cell = mappedPixelData[j]?.[i];
        const x = i * cs, y = j * cs;
        ctx.fillStyle = cell?.isExternal ? '#f0f0f0' : (cell?.color || '#FFFFFF');
        ctx.fillRect(x, y, cs, cs);
      }
    }

    ctx.strokeStyle = '#e5e5e5'; ctx.lineWidth = 0.5;
    for (let j = 0; j <= M; j++) { ctx.beginPath(); ctx.moveTo(0, j * cs); ctx.lineTo(N * cs, j * cs); ctx.stroke(); }
    for (let i = 0; i <= N; i++) { ctx.beginPath(); ctx.moveTo(i * cs, 0); ctx.lineTo(i * cs, M * cs); ctx.stroke(); }

    if (hoveredCell && mode === 'manual') {
      ctx.strokeStyle = '#FF6B9D'; ctx.lineWidth = 2;
      ctx.strokeRect(hoveredCell.col * cs, hoveredCell.row * cs, cs, cs);
    }
  }, [mappedPixelData, gridDimensions, hoveredCell, mode, zoom]);

  useEffect(() => { draw(); }, [draw]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    setZoom(prev => Math.min(5, Math.max(0.3, prev + delta)));
  }, []);

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
    if (!onCellHover || !gridDimensions) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cs = (canvasRef.current?.width || 1) / gridDimensions.N;
    const col = Math.floor((e.clientX - rect.left) / (cs * zoom));
    const row = Math.floor((e.clientY - rect.top) / (cs * zoom));
    if (row >= 0 && row < gridDimensions.M && col >= 0 && col < gridDimensions.N) {
      onCellHover(row, col);
    }
  }, [isPanning, onCellHover, gridDimensions, zoom]);

  const handleMouseUp = useCallback(() => setIsPanning(false), []);

  const getCell = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect || !gridDimensions) return null;
    const cs = (canvasRef.current?.width || 1) / gridDimensions.N;
    const col = Math.floor((e.clientX - rect.left) / (cs * zoom));
    const row = Math.floor((e.clientY - rect.top) / (cs * zoom));
    if (row >= 0 && row < gridDimensions.M && col >= 0 && col < gridDimensions.N) return { row, col };
    return null;
  };

  return (
    <div ref={containerRef} className="flex-1 flex items-center justify-center overflow-auto p-4 relative"
      onWheel={handleWheel} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      {mappedPixelData ? (
        <canvas ref={canvasRef}
          onClick={e => { if (!isPanning) { const c = getCell(e); if (c && mode === 'manual') onPixelClick?.(c.row, c.col); } }}
          className="rounded-xl shadow-md shadow-pink-100/50 cursor-crosshair"
          style={{
            imageRendering: 'pixelated',
            transform: `translate(${pan.x}px, ${pan.y}px)`,
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
      {mappedPixelData && (
        <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-white/90 rounded-xl shadow-md px-2 py-1 z-10">
          <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-pink-50 text-sm" onClick={() => setZoom(z => Math.min(5, z + 0.2))}>🔍+</button>
          <span className="text-xs text-[#2D3436]/50 w-12 text-center">{Math.round(zoom * 100)}%</span>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-pink-50 text-sm" onClick={() => setZoom(z => Math.max(0.3, z - 0.2))}>🔍-</button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-pink-50 text-sm" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}>↺</button>
        </div>
      )}
    </div>
  );
}
