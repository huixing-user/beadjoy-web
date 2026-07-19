'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { MappedPixel, GridDimensions } from '@/types/pixelation';

// ---- Material types ----
type Material = 'bead' | 'melted' | 'flat' | 'mini';

const MATERIALS: { key: Material; label: string; icon: string }[] = [
  { key: 'bead', label: '珠子', icon: '🔴' },
  { key: 'melted', label: '熨烫', icon: '🫠' },
  { key: 'flat', label: '平面', icon: '🟫' },
  { key: 'mini', label: '迷你', icon: '🔸' },
];

// ---- Drawing function with material modes ----
function drawBeads(
  canvas: HTMLCanvasElement,
  mappedPixelData: MappedPixel[][],
  gridDimensions: GridDimensions,
  cellSize: number,
  material: Material,
) {
  const { N, M } = gridDimensions;
  const cs = cellSize;
  const gap = material === 'flat' ? 0 : Math.max(1, Math.floor(cs * 0.10));
  const radius = material === 'flat' ? 0 : (material === 'melted' ? Math.floor(cs * 0.12) : Math.floor(cs * 0.25));

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

      // ----- Material rendering -----
      if (material === 'flat') {
        // Simple flat squares (like a pixel art printout)
        ctx.fillStyle = color;
        ctx.fillRect(x, y, cs, cs);
        continue;
      }

      if (material === 'bead') {
        // Bead: round rect + gradient + highlight dot
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(x, y, cs, cs, radius);
        ctx.fill();

        const g = ctx.createLinearGradient(x, y, x + cs, y + cs);
        g.addColorStop(0, 'rgba(255,255,255,0.4)');
        g.addColorStop(0.4, 'rgba(255,255,255,0.05)');
        g.addColorStop(1, 'rgba(0,0,0,0.18)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.roundRect(x, y, cs, cs, radius);
        ctx.fill();

        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.beginPath();
        const dotR = Math.max(1.2, cs * 0.1);
        ctx.arc(x + cs * 0.32, y + cs * 0.32, dotR, 0, Math.PI * 2);
        ctx.fill();
        continue;
      }

      if (material === 'melted') {
        // Melted/ironed: wider, softer beads that slightly "spill" into neighbours
        const spread = Math.max(1, Math.floor(cs * 0.08));
        const mx = x - spread;
        const my = y - spread;
        const mw = cs + spread * 2;
        const mh = cs + spread * 2;

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(mx, my, mw, mh, radius);
        ctx.fill();

        // Soft top-down lighting with a subtle inner shadow
        const g = ctx.createRadialGradient(x + cs * 0.3, y + cs * 0.3, cs * 0.1, x + cs / 2, y + cs / 2, cs * 0.8);
        g.addColorStop(0, 'rgba(255,255,255,0.25)');
        g.addColorStop(0.6, 'rgba(0,0,0,0.05)');
        g.addColorStop(1, 'rgba(0,0,0,0.22)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.roundRect(mx, my, mw, mh, radius);
        ctx.fill();

        // Tiny center glow simulating ironed plastic
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.beginPath();
        const dotR = Math.max(1, cs * 0.08);
        ctx.arc(x + cs / 2, y + cs / 2, dotR, 0, Math.PI * 2);
        ctx.fill();
        continue;
      }

      if (material === 'mini') {
        // Mini beads: small with more gap, very round
        const miniCs = cs * 0.7;
        const offset = (cs - miniCs) / 2;
        const mx = x + offset;
        const my = y + offset;

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(mx, my, miniCs, miniCs, miniCs * 0.4);
        ctx.fill();

        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.arc(mx + miniCs * 0.3, my + miniCs * 0.3, miniCs * 0.12, 0, Math.PI * 2);
        ctx.fill();
        continue;
      }
    }
  }
}

// ---- Small preview ----
function PreviewContent({ mappedPixelData, gridDimensions, material, cellSize = 14 }: {
  mappedPixelData: MappedPixel[][] | null; gridDimensions: GridDimensions | null; material: Material; cellSize?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !mappedPixelData || !gridDimensions) return;
    drawBeads(canvas, mappedPixelData, gridDimensions, cellSize, material);
  }, [mappedPixelData, gridDimensions, cellSize, material]);

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

// ---- Main component ----
export default function LargePreview({ mappedPixelData, gridDimensions }: {
  mappedPixelData: MappedPixel[][] | null; gridDimensions: GridDimensions | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const [material, setMaterial] = useState<Material>('bead');
  const modalCanvasRef = useRef<HTMLCanvasElement>(null);

  const redrawModal = useCallback(() => {
    if (expanded && modalCanvasRef.current && mappedPixelData && gridDimensions) {
      const largerCellSize = Math.max(4, Math.min(16, Math.floor(300 / gridDimensions.N)));
      drawBeads(modalCanvasRef.current, mappedPixelData, gridDimensions, largerCellSize, material);
    }
  }, [expanded, mappedPixelData, gridDimensions, material]);

  useEffect(() => { redrawModal(); }, [redrawModal]);

  return (
    <>
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-[#2D3436]">🔮 拼豆效果预览</h3>
        <div
          className="overflow-auto max-h-[200px] rounded-2xl border border-gray-100 bg-[#f0f0f0] p-2 cursor-pointer"
          onClick={() => setExpanded(true)}
          title="点击放大预览"
        >
          <PreviewContent mappedPixelData={mappedPixelData} gridDimensions={gridDimensions} material={material} cellSize={14} />
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

            {/* Material selector */}
            <div className="flex items-center gap-1 mb-4 bg-gray-100 rounded-2xl p-1">
              {MATERIALS.map(m => (
                <button
                  key={m.key}
                  onClick={() => setMaterial(m.key)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    material === m.key ? 'bg-white text-[#FF6B9D] shadow-sm' : 'text-[#2D3436]/50 hover:text-[#2D3436]/80'
                  }`}
                >
                  {m.icon} {m.label}
                </button>
              ))}
            </div>

            <canvas ref={modalCanvasRef} className="max-w-full rounded-xl" style={{ imageRendering: 'auto' }} />
            {mappedPixelData && gridDimensions && (
              <p className="text-xs text-[#2D3436]/40 mt-3 text-center">
                {gridDimensions.N}×{gridDimensions.M} · {material === 'melted' ? '熨烫效果' : material === 'bead' ? '珠子效果' : material === 'mini' ? '迷你珠子' : '平面效果'}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
