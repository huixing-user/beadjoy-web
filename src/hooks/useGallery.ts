'use client';

import { useState, useCallback, useEffect } from 'react';
import { GalleryItem } from '@/types/gallery';

const STORAGE_KEY = 'beadjoy_gallery';

let _itemCounter = 0;

function loadItems(): GalleryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function generateId(): string {
  _itemCounter++;
  return `g_${_itemCounter}_${Math.random().toString(36).slice(2, 6)}`;
}

function getNowISO(): string {
  return new Date().toISOString();
}

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function useGallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);

  useEffect(() => { setItems(loadItems()); }, []);

  const addItem = useCallback((item: Omit<GalleryItem, 'id' | 'likes' | 'createdAt' | 'userLiked'>) => {
    if (!isBrowser()) return null as unknown as GalleryItem;
    const newItem: GalleryItem = {
      ...item,
      id: generateId(),
      likes: 0,
      createdAt: getNowISO(),
      userLiked: false,
    };
    setItems(prev => { const next = [newItem, ...prev]; localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); return next; });
    return newItem;
  }, []);

  const toggleLike = useCallback((id: string) => {
    if (!isBrowser()) return;
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
