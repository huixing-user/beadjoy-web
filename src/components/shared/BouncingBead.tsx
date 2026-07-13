import React from 'react';

export default function BouncingBead({ text = '加载中...' }: { text?: string }) {
  const beads = ['🟡', '🟢', '🔵', '🟣', '🟠'];
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <div className="flex gap-2">
        {beads.map((bead, i) => (
          <span key={i} className="text-3xl animate-bounce-in" style={{ animationDelay: `${i * 0.1}s` }}>
            {bead}
          </span>
        ))}
      </div>
      <p className="text-[#2D3436]/60 animate-pulse">{text}</p>
    </div>
  );
}
