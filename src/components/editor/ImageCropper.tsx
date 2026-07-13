'use client';

import React, { useState, useRef, useEffect } from 'react';

type Props = {
  imageSrc: string;
  onCropConfirm: (croppedImageSrc: string) => void;
  onCancel: () => void;
};

export default function ImageCropper({ imageSrc, onCropConfirm, onCancel }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [selection, setSelection] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Load image
  useEffect(() => {
    const image = new Image();
    image.onload = () => setImg(image);
    image.src = imageSrc;
  }, [imageSrc]);

  // Draw image + selection overlay
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !img) return;

    // Fit image to canvas
    const maxW = Math.min(800, window.innerWidth - 80);
    const scale = Math.min(1, maxW / img.width);
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Draw selection
    if (selection) {
      ctx.fillStyle = 'rgba(255, 107, 157, 0.3)';
      ctx.fillRect(selection.x, selection.y, selection.w, selection.h);
      ctx.strokeStyle = '#FF6B9D';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 3]);
      ctx.strokeRect(selection.x, selection.y, selection.w, selection.h);
      ctx.setLineDash([]);

      // Dim areas outside selection
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(0, 0, canvas.width, selection.y); // top
      ctx.fillRect(0, selection.y + selection.h, canvas.width, canvas.height - selection.y - selection.h); // bottom
      ctx.fillRect(0, selection.y, selection.x, selection.h); // left
      ctx.fillRect(selection.x + selection.w, selection.y, canvas.width - selection.x - selection.w, selection.h); // right
    }
  }, [img, selection]);

  const toCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = toCanvasCoords(e);
    setDragging(true);
    setDragStart({ x, y });
    setSelection({ x, y, w: 0, h: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragging) return;
    const { x, y } = toCanvasCoords(e);
    setSelection({
      x: Math.min(dragStart.x, x),
      y: Math.min(dragStart.y, y),
      w: Math.abs(x - dragStart.x),
      h: Math.abs(y - dragStart.y),
    });
  };

  const handleMouseUp = () => setDragging(false);

  const doCrop = () => {
    if (!selection || !img || !canvasRef.current) return;
    const canvas = canvasRef.current;
    // Map canvas coordinates back to original image coordinates
    const scaleX = img.width / canvas.width;
    const scaleY = img.height / canvas.height;
    const sx = Math.round(selection.x * scaleX);
    const sy = Math.round(selection.y * scaleY);
    const sw = Math.round(selection.w * scaleX);
    const sh = Math.round(selection.h * scaleY);

    const outCanvas = document.createElement('canvas');
    outCanvas.width = sw;
    outCanvas.height = sh;
    const outCtx = outCanvas.getContext('2d')!;
    outCtx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
    onCropConfirm(outCanvas.toDataURL('image/png'));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-3xl w-full shadow-2xl">
        <h2 className="text-lg font-bold text-[#2D3436] mb-4">✂️ 框选想要的区域</h2>

        {img ? (
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="cursor-crosshair rounded-xl max-w-full"
          />
        ) : (
          <div className="h-64 flex items-center justify-center text-[#2D3436]/30">加载中...</div>
        )}

        <div className="flex gap-3 mt-4 justify-end">
          <button onClick={onCancel} className="px-6 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-sm font-medium transition-colors">
            取消
          </button>
          <button
            onClick={doCrop}
            disabled={!selection || selection.w < 5 || selection.h < 5}
            className="px-6 py-2.5 rounded-2xl bg-[#FF6B9D] text-white hover:bg-[#e55a8a] text-sm font-medium transition-colors disabled:opacity-40 shadow-md shadow-pink-200/50"
          >
            确认裁剪 ✂️
          </button>
        </div>

        <p className="text-xs text-[#2D3436]/40 mt-2 text-center">在图片上拖拽框选后点击确认</p>
      </div>
    </div>
  );
}
