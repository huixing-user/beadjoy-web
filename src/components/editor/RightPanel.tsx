'use client';

import React, { useState } from 'react';

export default function RightPanel({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className={`bg-white rounded-3xl shadow-md shadow-pink-100/50 transition-all duration-300 ${collapsed ? 'w-auto px-2 py-3' : 'w-[280px]'}`}>
      <button onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-1 px-3 h-7 rounded-full bg-gray-100 hover:bg-pink-50 text-xs transition-colors mb-2"
        title={collapsed ? '展开面板' : '折叠面板'}>
        {collapsed ? '◀' : '▶ 收起'}
      </button>
      <div className={`space-y-3 pr-1 ${collapsed ? 'hidden' : ''}`}>
        {children}
      </div>
    </div>
  );
}
