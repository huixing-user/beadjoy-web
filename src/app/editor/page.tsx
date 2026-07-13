'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { EditorMode } from '@/types/pixelation';
import { useImageProcessor } from '@/hooks/useImageProcessor';
import { useGallery } from '@/hooks/useGallery';
import { downloadPattern, downloadShoppingList } from '@/utils/imageDownloader';
import ModeSwitcher from '@/components/editor/ModeSwitcher';
import LeftToolbar from '@/components/editor/LeftToolbar';
import CanvasPreview from '@/components/editor/CanvasPreview';
import RightPanel from '@/components/editor/RightPanel';
import PaletteSelector from '@/components/editor/PaletteSelector';
import SliderControls from '@/components/editor/SliderControls';
import ColorStatsPanel from '@/components/editor/ColorStatsPanel';
import ExportButtons from '@/components/editor/ExportButtons';
import StatusBar from '@/components/editor/StatusBar';
import BouncingBead from '@/components/shared/BouncingBead';
import UploadZone from '@/components/shared/UploadZone';

function EditorContent() {
  const searchParams = useSearchParams();
  const { state, isProcessing, processImage, setMode, setGranularity, setThreshold, setColorSystem } = useImageProcessor();
  const { addItem } = useGallery();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [excludedColors, setExcludedColors] = useState<Set<string>>(new Set());
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (searchParams.get('mode') === 'ai') setMode('ai');
  }, [searchParams, setMode]);

  useEffect(() => {
    const stored = sessionStorage.getItem('uploadedImage');
    if (stored) {
      const img = new Image();
      img.onload = () => { imgRef.current = img; setImageLoaded(true); processImage(img); };
      img.src = stored;
      sessionStorage.removeItem('uploadedImage');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleImageSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => { imgRef.current = img; setImageLoaded(true); processImage(img); };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleModeChange = (mode: EditorMode) => {
    setMode(mode);
    if (imgRef.current) processImage(imgRef.current, { mode });
  };

  const doRegenerate = () => {
    if (imgRef.current) processImage(imgRef.current);
  };

  const handleToggleExclude = (hex: string) => {
    setExcludedColors(prev => { const n = new Set(prev); n.has(hex) ? n.delete(hex) : n.add(hex); return n; });
  };

  const handleShareToGallery = () => {
    if (!state.mappedPixelData || !state.gridDimensions || !state.colorCounts) return;
    const scale = 4;
    const canvas = document.createElement('canvas');
    canvas.width = state.gridDimensions.N * scale;
    canvas.height = state.gridDimensions.M * scale;
    const ctx = canvas.getContext('2d')!;
    state.mappedPixelData.forEach((row, j) => row.forEach((cell, i) => {
      if (cell && !cell.isExternal) { ctx.fillStyle = cell.color; ctx.fillRect(i * scale, j * scale, scale, scale); }
    }));
    addItem({
      title: `拼豆作品 ${state.gridDimensions.N}×${state.gridDimensions.M}`,
      imageDataUrl: canvas.toDataURL('image/png'),
      gridSize: `${state.gridDimensions.N}×${state.gridDimensions.M}`,
      colorCount: Object.keys(state.colorCounts).length,
      beadCount: state.totalBeadCount,
    });
    alert('✅ 已分享到画廊！');
  };

  if (!imageLoaded) {
    return (
      <div className="max-w-xl mx-auto px-6 py-20">
        <UploadZone onImageSelect={handleImageSelect} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between px-4 py-2 bg-white/50 border-b border-pink-100">
        <ModeSwitcher currentMode={state.mode} onModeChange={handleModeChange} />
        <button onClick={doRegenerate} className="text-sm text-[#FF6B9D] hover:underline">🔄 重新生成</button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="p-3 flex-shrink-0"><LeftToolbar mode={state.mode} /></div>

        {isProcessing ? (
          <div className="flex-1 flex items-center justify-center"><BouncingBead text="正在处理图片..." /></div>
        ) : (
          <CanvasPreview mappedPixelData={state.mappedPixelData} gridDimensions={state.gridDimensions} mode={state.mode}
            onPixelClick={(r, c) => state.mode === 'manual' && console.log('clicked', r, c)}
            hoveredCell={hoveredCell} onCellHover={(r, c) => setHoveredCell({ row: r, col: c })} />
        )}

        <div className="p-3 flex-shrink-0">
          <RightPanel>
            <PaletteSelector selectedSystem={state.selectedColorSystem} paletteSize={state.paletteSize}
              onSystemChange={setColorSystem} onSizeChange={() => {}} />
            <SliderControls granularity={state.granularity} threshold={state.similarityThreshold}
              onGranularityChange={g => { setGranularity(g); doRegenerate(); }}
              onThresholdChange={t => { setThreshold(t); doRegenerate(); }} />
            <ColorStatsPanel colorCounts={state.colorCounts} excludedColors={excludedColors} onToggleExclude={handleToggleExclude} />
            <ExportButtons hasData={!!state.mappedPixelData}
              onDownload={() => state.mappedPixelData && state.gridDimensions && state.colorCounts &&
                downloadPattern(state.mappedPixelData, state.gridDimensions, state.colorCounts, state.totalBeadCount, state.selectedColorSystem)}
              onDownloadList={() => state.colorCounts && downloadShoppingList(state.colorCounts, state.totalBeadCount, state.selectedColorSystem)}
              onShareToGallery={handleShareToGallery} />
          </RightPanel>
        </div>
      </div>

      <StatusBar colorCount={state.colorCounts ? Object.keys(state.colorCounts).length : 0} totalBeadCount={state.totalBeadCount} gridDimensions={state.gridDimensions} />
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><BouncingBead text="加载中..." /></div>}>
      <EditorContent />
    </Suspense>
  );
}
