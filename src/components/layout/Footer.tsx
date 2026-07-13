import React from 'react';

export default function Footer() {
  return (
    <footer className="border-t border-pink-100 bg-white/50 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#2D3436]/50">
        <p>© 2025 慧星豆趣 — 让每一颗拼豆都充满乐趣 🧸</p>
        <div className="flex items-center gap-4">
          <a href="https://github.com/huixing-user/beadjoy-web" target="_blank" rel="noopener noreferrer" className="hover:text-[#FF6B9D] transition-colors">GitHub</a>
          <span>·</span>
          <span>Made with 💖</span>
        </div>
      </div>
    </footer>
  );
}
