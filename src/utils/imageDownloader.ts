import { MappedPixel, GridDimensions, ColorCount, ColorSystem } from '@/types/pixelation';
import { getColorKeyByHex } from './colorSystemUtils';
import { hexToRgb } from './pixelation';

function getContrastColor(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#000000';
  const luma = (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;
  return luma > 0.5 ? '#000000' : '#FFFFFF';
}

export function downloadPattern(
  mappedPixelData: MappedPixel[][], gridDimensions: GridDimensions,
  colorCounts: Record<string, ColorCount>, totalBeadCount: number, selectedColorSystem: ColorSystem,
): void {
  const { N, M } = gridDimensions;
  const cellSize = 30, padding = 40, titleHeight = 60;
  const canvas = document.createElement('canvas');
  canvas.width = N * cellSize + padding * 2;
  canvas.height = titleHeight + M * cellSize + padding * 3;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Title bar
  ctx.fillStyle = '#FF6B9D'; ctx.fillRect(0, 0, canvas.width, titleHeight);
  ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 20px sans-serif'; ctx.textAlign = 'left';
  ctx.fillText('🧸 慧星豆趣 · 拼豆底稿', padding, 38);

  // Grid
  for (let j = 0; j < M; j++) {
    for (let i = 0; i < N; i++) {
      const cell = mappedPixelData[j]?.[i];
      const x = padding + i * cellSize, y = titleHeight + padding + j * cellSize;
      if (cell && !cell.isExternal) {
        ctx.fillStyle = cell.color; ctx.fillRect(x, y, cellSize, cellSize);
        const key = getColorKeyByHex(cell.color, selectedColorSystem);
        const fs = Math.max(7, Math.floor(cellSize * 0.35));
        ctx.fillStyle = getContrastColor(cell.color);
        ctx.font = `bold ${fs}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(key, x + cellSize / 2, y + cellSize / 2);
      } else {
        ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x, y, cellSize, cellSize);
      }
      ctx.strokeStyle = '#E5E5E5'; ctx.lineWidth = 0.5; ctx.strokeRect(x, y, cellSize, cellSize);
    }
  }

  // Footer
  ctx.fillStyle = '#999999'; ctx.font = '12px sans-serif'; ctx.textAlign = 'right';
  ctx.fillText(`颜色: ${Object.keys(colorCounts).length} 种 | 总粒数: ${totalBeadCount} | 慧星豆趣`, canvas.width - padding, canvas.height - 15);

  const link = document.createElement('a');
  link.download = `beadjoy-pattern-${N}x${M}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

export function downloadShoppingList(
  colorCounts: Record<string, ColorCount>, totalBeadCount: number, selectedColorSystem: ColorSystem,
): void {
  const entries = Object.entries(colorCounts).sort(([, a], [, b]) => b.count - a.count);
  const itemHeight = 30, padding = 30, width = 360;
  const height = padding * 2 + entries.length * itemHeight + 60;

  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#4ECDC4'; ctx.fillRect(0, 0, width, 50);
  ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('📋 慧星豆趣 · 采购清单', width / 2, 33);

  entries.forEach(([hex, { count, color }], i) => {
    const y = 60 + i * itemHeight;
    ctx.fillStyle = color; ctx.fillRect(padding, y + 3, 24, 24);
    ctx.strokeStyle = '#CCCCCC'; ctx.strokeRect(padding, y + 3, 24, 24);
    ctx.fillStyle = '#333333'; ctx.font = '13px sans-serif'; ctx.textAlign = 'left';
    const key = getColorKeyByHex(hex, selectedColorSystem);
    ctx.fillText(`${key}  ${hex}`, padding + 34, y + 19);
    ctx.textAlign = 'right';
    ctx.fillText(`${count} 颗`, width - padding, y + 19);
  });

  const link = document.createElement('a');
  link.download = 'beadjoy-shopping-list.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}
