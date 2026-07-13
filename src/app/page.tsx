'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import UploadZone from '@/components/shared/UploadZone';
import BeadButton from '@/components/shared/BeadButton';
import BeadCard from '@/components/shared/BeadCard';
import { useGallery } from '@/hooks/useGallery';

export default function Home() {
  const router = useRouter();
  const { items } = useGallery();

  const handleImageSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      sessionStorage.setItem('uploadedImage', reader.result as string);
      router.push('/editor');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[55vh]">
        {/* Left */}
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[#2D3436] mb-3">让每一颗拼豆</h1>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[#FF6B9D] mb-4">都充满乐趣 🧸</h1>
            <p className="text-[#2D3436]/60 text-lg">上传图片，一键生成拼豆底稿图纸。AI 智能优化，多品牌色号适配！</p>
          </div>
          <UploadZone onImageSelect={handleImageSelect} />
          <div className="flex gap-3 flex-wrap">
            <BeadButton variant="primary" size="lg" onClick={() => router.push('/editor')}>🎨 快速出图</BeadButton>
            <BeadButton variant="secondary" size="lg" onClick={() => router.push('/editor?mode=ai')}>🤖 AI 优化</BeadButton>
          </div>
        </div>

        {/* Right — Visual */}
        <div className="hidden lg:flex items-center justify-center">
          <BeadCard className="w-full max-w-md aspect-square flex flex-col items-center justify-center gap-4 p-8">
            <div className="grid grid-cols-5 gap-2 animate-float">
              {['#FF6B9D','#4ECDC4','#C3B1E1','#FFE66D','#FF6B9D',
                '#4ECDC4','#FFE66D','#FF6B9D','#C3B1E1','#4ECDC4',
                '#C3B1E1','#FF6B9D','#4ECDC4','#FFE66D','#FF6B9D',
                '#FFE66D','#C3B1E1','#FF6B9D','#4ECDC4','#C3B1E1',
                '#FF6B9D','#4ECDC4','#FFE66D','#C3B1E1','#FF6B9D'].map((c, i) => (
                <div key={i} className="w-6 h-6 sm:w-8 sm:h-8 rounded-md" style={{ backgroundColor: c }} />
              ))}
            </div>
            <p className="text-[#2D3436]/40 text-sm mt-2">🌟 慧星 · 拼豆精灵</p>
          </BeadCard>
        </div>
      </div>

      {/* Gallery Preview */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#2D3436]">🌟 社区画廊</h2>
          <Link href="/gallery"><BeadButton variant="outline" size="sm">查看更多 →</BeadButton></Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
          {items.length === 0 ? (
            <BeadCard className="flex-shrink-0 w-48 h-36 flex items-center justify-center text-[#2D3436]/30">
              <div className="text-center"><span className="text-3xl block mb-1">🎨</span><span className="text-sm">还没有作品，快来创作吧！</span></div>
            </BeadCard>
          ) : (
            items.slice(0, 8).map(item => (
              <div key={item.id} className="flex-shrink-0 w-48 snap-start">
                <BeadCard className="p-3 cursor-pointer hover:scale-105 transition-transform">
                  <img src={item.imageDataUrl} alt={item.title} className="w-full aspect-square object-cover rounded-xl mb-2" />
                  <p className="text-xs text-[#2D3436]/60 truncate">{item.title}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-[#FF6B9D]">❤️ {item.likes}</span>
                    <span className="text-xs text-[#2D3436]/40">{item.colorCount}色</span>
                  </div>
                </BeadCard>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
