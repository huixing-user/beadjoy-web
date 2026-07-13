'use client';

import React, { useState } from 'react';
import GalleryCard from './GalleryCard';
import { GalleryItem } from '@/types/gallery';

export default function GalleryGrid({ items, onLike }: { items: GalleryItem[]; onLike: (id: string) => void }) {
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');

  const sorted = [...items].sort((a, b) => {
    if (sortBy === 'popular') return b.likes - a.likes;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  if (items.length === 0) {
    return (
      <div className="text-center py-20 text-[#2D3436]/30">
        <span className="text-6xl block mb-4">🖼️</span>
        <p className="text-lg">画廊还是空的，快去创作第一个作品吧！</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <div className="flex bg-gray-100 rounded-xl p-1">
          {([['latest', '最新'], ['popular', '最热']] as const).map(([key, label]) => (
            <button key={key} onClick={() => setSortBy(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${sortBy === key ? 'bg-white shadow-sm text-[#FF6B9D]' : 'text-[#2D3436]/50'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {sorted.map(item => <GalleryCard key={item.id} item={item} onLike={onLike} />)}
      </div>
    </div>
  );
}
