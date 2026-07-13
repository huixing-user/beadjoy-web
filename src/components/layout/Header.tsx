'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const linkClass = (href: string) =>
    `transition-colors ${pathname === href ? 'text-[#FF6B9D] font-semibold' : 'text-[#2D3436]/70 hover:text-[#FF6B9D]'}`;

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-pink-100">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-[#2D3436] hover:scale-105 transition-transform">
          <span className="text-2xl">🧸</span>
          <span>慧星豆趣</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="/editor" className={linkClass('/editor')}>🎨 开始创作</Link>
          <Link href="/gallery" className={linkClass('/gallery')}>🌟 画廊</Link>
          <Link href="/about" className={linkClass('/about')}>💰 支持我们</Link>
        </nav>
      </div>
    </header>
  );
}
