'use client';

import React, { useState, DragEvent, useRef } from 'react';

type UploadZoneProps = { onImageSelect: (file: File) => void };

export default function UploadZone({ onImageSelect }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith('image/')) onImageSelect(file);
  };

  const handleClick = () => inputRef.current?.click();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onImageSelect(file);
  };

  return (
    <div
      onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={handleClick}
      className={`relative cursor-pointer rounded-3xl border-2 border-dashed p-12 flex flex-col items-center justify-center gap-3 transition-all duration-300 ${
        isDragging ? 'border-[#FF6B9D] bg-pink-50 scale-[1.02]' : 'border-gray-300 bg-white hover:border-[#FF6B9D] hover:bg-pink-50/50'
      }`}
    >
      <span className="text-5xl animate-float">📷</span>
      <p className="text-lg font-semibold text-[#2D3436]">点击或拖拽上传图片</p>
      <p className="text-sm text-gray-400">支持 JPG / PNG 格式</p>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png" onChange={handleFileChange} className="hidden" />
    </div>
  );
}
