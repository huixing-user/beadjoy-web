'use client';

import { useState, useCallback, useEffect } from 'react';
import { GalleryItem } from '@/types/gallery';

const STORAGE_KEY = 'beadjoy_gallery';

function loadItems(): GalleryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function useGallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);

  useEffect(() => { setItems(loadItems()); }, []);

  const addItem = useCallback((item: Omit<GalleryItem, 'id' | 'likes' | 'createdAt' | 'userLiked'>) => {
    const newItem: GalleryItem = {
      ...item,
      id: `g_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      likes: 0,
      createdAt: new Date().toISOString(),
      userLiked: false,
    };
    setItems(prev => { const next = [newItem, ...prev]; localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); return next; });
    return newItem;
  }, []);

  const toggleLike = useCallback((id: string) => {
    setItems(prev => {
      const next = prev.map(item => {
        if (item.id !== id) return item;
        return { ...item, likes: item.userLiked ? item.likes - 1 : item.likes + 1, userLiked: !item.userLiked };
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { items, addItem, toggleLike };
}
