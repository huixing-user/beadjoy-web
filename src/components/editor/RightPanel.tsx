'use client';

import React, { useState } from 'react';

export default function RightPanel({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className={`relative bg-white rounded-3xl shadow-md shadow-pink-100/50 transition-all duration-300 overflow-hidden ${collapsed ? 'w-10' : 'w-72'}`}>
      <button onClick={() => setCollapsed(!collapsed)}
        className="absolute top-4 left-2 w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 hover:bg-pink-50 text-xs z-10 transition-colors"
        title={collapsed ? '展开面板' : '折叠面板'}>
        {collapsed ? '▶' : '◀'}
      </button>
      <div className={`p-4 pt-10 space-y-6 ${collapsed ? 'hidden' : ''}`}>{children}</div>
    </div>
  );
}
