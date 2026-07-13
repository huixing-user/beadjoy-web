'use client';

import React, { useState } from 'react';
import BeadCard from '@/components/shared/BeadCard';
import { GalleryItem } from '@/types/gallery';

export default function GalleryCard({ item, onLike }: { item: GalleryItem; onLike: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <BeadCard className="p-3 cursor-pointer hover:scale-[1.03] transition-transform">
        <div onClick={() => setExpanded(true)}>
          <img src={item.imageDataUrl} alt={item.title} className="w-full aspect-square object-cover rounded-2xl mb-3" />
          <p className="text-sm font-medium text-[#2D3436] truncate">{item.title}</p>
          <div className="flex items-center justify-between mt-1.5 text-xs text-[#2D3436]/40">
            <span>{item.gridSize} · {item.colorCount}色 · {item.beadCount}粒</span>
          </div>
        </div>
        <button onClick={() => onLike(item.id)}
          className={`mt-2 flex items-center gap-1 text-sm transition-all ${item.userLiked ? 'text-[#FF6B9D] scale-110' : 'text-[#2D3436]/30 hover:text-[#FF6B9D]'}`}>
          {item.userLiked ? '❤️' : '🤍'} {item.likes}
        </button>
      </BeadCard>

      {expanded && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-8" onClick={() => setExpanded(false)}>
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <img src={item.imageDataUrl} alt={item.title} className="w-full rounded-2xl mb-4" />
            <h2 className="text-lg font-bold text-[#2D3436]">{item.title}</h2>
            <p className="text-sm text-[#2D3436]/50">{item.gridSize} · {item.colorCount} 种颜色 · {item.beadCount} 粒 · ❤️ {item.likes}</p>
            <button onClick={() => setExpanded(false)} className="mt-4 w-full py-2 bg-gray-100 rounded-xl text-sm hover:bg-gray-200 transition-colors">关闭</button>
          </div>
        </div>
      )}
    </>
  );
}
