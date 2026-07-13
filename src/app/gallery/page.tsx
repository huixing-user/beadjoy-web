'use client';

import React from 'react';
import Link from 'next/link';
import { useGallery } from '@/hooks/useGallery';
import GalleryGrid from '@/components/gallery/GalleryGrid';
import BeadButton from '@/components/shared/BeadButton';

export default function GalleryPage() {
  const { items, toggleLike } = useGallery();

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#2D3436]">🌟 社区画廊</h1>
          <p className="text-[#2D3436]/50 mt-1">拼豆爱好者的作品分享</p>
        </div>
        <Link href="/editor"><BeadButton variant="primary">🎨 开始创作</BeadButton></Link>
      </div>
      <GalleryGrid items={items} onLike={toggleLike} />
    </div>
  );
}
