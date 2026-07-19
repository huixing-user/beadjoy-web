'use client';

import React, { useState } from 'react';

export default function RightPanel({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className={`relative bg-white rounded-3xl shadow-md shadow-pink-100/50 transition-all duration-300 ${collapsed ? 'w-auto px-3 py-4' : 'w-72'}`}>
      <button onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center gap-1 w-auto px-3 h-7 rounded-full bg-gray-100 hover:bg-pink-50 text-xs z-10 transition-colors mb-3 sticky top-0"
        title={collapsed ? '展开面板' : '折叠面板'}>
        {collapsed ? '◀ 展开' : '▶ 收起'}
      </button>
      <div className={`space-y-6 pr-1 ${collapsed ? 'hidden' : ''}`} style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
        {children}
      </div>
    </div>
  );
}
