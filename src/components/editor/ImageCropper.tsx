'use client';

import React, { useState, useRef, useEffect } from 'react';

type Props = {
  imageSrc: string;
  onCropConfirm: (croppedImageSrc: string) => void;
  onCancel: () => void;
};

type Selection = { x: number; y: number; w: number; h: number };
type DragMode = 'none' | 'new' | 'move' | 'resize';

export default function ImageCropper({ imageSrc, onCropConfirm, onCancel }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [dragMode, setDragMode] = useState<DragMode>('none');
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const image = new Image();
    image.onload = () => setImg(image);
    image.src = imageSrc;
  }, [imageSrc]);

  // Compute display scale
  const displayScale = img ? Math.min(1, Math.min(1000, window.innerWidth - 80) / img.width) : 1;

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas || !img) return;
    const dw = img.width * displayScale;
    const dh = img.height * displayScale;
    canvas.width = dw;
    canvas.height = dh;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0, dw, dh);

    if (selection && selection.w > 0) {
      const s = selection;
      // Dim outside
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fillRect(0, 0, dw, s.y);
      ctx.fillRect(0, s.y + s.h, dw, dh - s.y - s.h);
      ctx.fillRect(0, s.y, s.x, s.h);
      ctx.fillRect(s.x + s.w, s.y, dw - s.x - s.w, s.h);

      // Selection fill
      ctx.fillStyle = 'rgba(255,107,157,0.25)';
      ctx.fillRect(s.x, s.y, s.w, s.h);

      // Border
      ctx.strokeStyle = '#FF6B9D'; ctx.lineWidth = 2; ctx.setLineDash([6,3]);
      ctx.strokeRect(s.x, s.y, s.w, s.h);
      ctx.setLineDash([]);

      // Corner handles
      ctx.fillStyle = '#FF6B9D';
      const R = 5;
      for (const [cx, cy] of [[s.x,s.y],[s.x+s.w,s.y],[s.x,s.y+s.h],[s.x+s.w,s.y+s.h]]) {
        ctx.fillRect(cx-R, cy-R, R*2, R*2);
      }
    }
  }

  useEffect(() => { draw(); }, [img, selection]); // eslint-disable-line

  const toCanvas = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleSize = (s: Selection) => {
    const dw = img ? img.width * displayScale : 1;
    const dh = img ? img.height * displayScale : 1;
    let { x, y, w, h } = s;
    if (x < 0) { w += x; x = 0; }
    if (y < 0) { h += y; y = 0; }
    if (x + w > dw) w = dw - x;
    if (y + h > dh) h = dh - y;
    return { x, y, w: Math.max(1, w), h: Math.max(1, h) };
  };

  const isCorner = (cx: number, cy: number, s: Selection) => {
    const R = 8;
    const corners: [number, number][] = [[s.x,s.y],[s.x+s.w,s.y],[s.x,s.y+s.h],[s.x+s.w,s.y+s.h]];
    for (const [cx1, cy1] of corners) {
      if (Math.abs(cx - cx1) < R && Math.abs(cy - cy1) < R) return true;
    }
    return false;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const p = toCanvas(e);
    if (selection && selection.w > 4 && isCorner(p.x, p.y, selection)) {
      setDragMode('resize');
      setDragStart(p);
    } else if (selection && p.x > selection.x && p.x < selection.x + selection.w && p.y > selection.y && p.y < selection.y + selection.h) {
      setDragMode('move');
      setDragStart(p);
    } else {
      setDragMode('new');
      setDragStart(p);
      setSelection({ x: p.x, y: p.y, w: 0, h: 0 });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (dragMode === 'none') return;
    const p = toCanvas(e);

    if (dragMode === 'new') {
      setSelection(handleSize({
        x: Math.min(dragStart.x, p.x), y: Math.min(dragStart.y, p.y),
        w: Math.abs(p.x - dragStart.x), h: Math.abs(p.y - dragStart.y),
      }));
    } else if (dragMode === 'move' && selection) {
      const dx = p.x - dragStart.x, dy = p.y - dragStart.y;
      setDragStart(p);
      setSelection(prev => prev ? handleSize({ ...prev, x: prev.x + dx, y: prev.y + dy }) : null);
    } else if (dragMode === 'resize' && selection) {
      setDragStart(p);
      setSelection(prev => {
        if (!prev) return null;
        let { x, y, w, h } = prev;
        // Resize based on which corner is closest to dragStart
        const cx = Math.abs(p.x - x) < Math.abs(p.x - (x + w)) ? x : x + w;
        const cy = Math.abs(p.y - y) < Math.abs(p.y - (y + h)) ? y : y + h;
        const nx = Math.min(p.x, cx), ny = Math.min(p.y, cy);
        const nw = Math.abs(p.x - cx), nh = Math.abs(p.y - cy);
        return handleSize({ x: nx, y: ny, w: nw, h: nh });
      });
    }
  };

  const handleMouseUp = () => setDragMode('none');

  const doCrop = () => {
    if (!selection || !img) return;
    const scaleX = img.width / (img.width * displayScale);
    const scaleY = img.height / (img.height * displayScale);
    const sx = Math.round(selection.x * scaleX);
    const sy = Math.round(selection.y * scaleY);
    const sw = Math.round(selection.w * scaleX);
    const sh = Math.round(selection.h * scaleY);
    const outCanvas = document.createElement('canvas');
    outCanvas.width = sw; outCanvas.height = sh;
    outCanvas.getContext('2d')!.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
    onCropConfirm(outCanvas.toDataURL('image/png'));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-[95vw] w-full shadow-2xl">
        <h2 className="text-lg font-bold text-[#2D3436] mb-4">✂️ 框选想要的区域（可拖拽移动+四角缩放）</h2>
        {img ? (
          <canvas ref={canvasRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
            className="cursor-crosshair rounded-xl max-w-full border border-gray-100" />
        ) : (
          <div className="h-64 flex items-center justify-center text-[#2D3436]/30">加载中...</div>
        )}
        <div className="flex gap-3 mt-4 justify-end">
          <button onClick={onCancel} className="px-6 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-sm font-medium">取消</button>
          <button onClick={doCrop} disabled={!selection || selection.w < 5 || selection.h < 5}
            className="px-6 py-2.5 rounded-2xl bg-[#FF6B9D] text-white hover:bg-[#e55a8a] text-sm font-medium disabled:opacity-40 shadow-md shadow-pink-200/50">确认裁剪 ✂️</button>
        </div>
        <p className="text-xs text-[#2D3436]/40 mt-2 text-center">拖拽框选 · 拖动中间移动 · 拖拽四角缩放</p>
      </div>
    </div>
  );
}
