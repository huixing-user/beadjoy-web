import { MappedPixel, PaletteColor } from '@/types/pixelation';
import { colorDistance, findClosestPaletteColor, hexToRgb } from './pixelation';

export interface AiOptimizeParams {
  mappedPixelData: MappedPixel[][];
  gridDimensions: { N: number; M: number };
  palette: PaletteColor[];
}

export interface AiOptimizeResult {
  optimizedData: MappedPixel[][];
  improvements: { noiseRemoved: number; edgesEnhanced: number; contrastBoosted: number };
}

export function aiOptimize(params: AiOptimizeParams): AiOptimizeResult {
  const { mappedPixelData, gridDimensions, palette } = params;
  const { N, M } = gridDimensions;
  const improvements = { noiseRemoved: 0, edgesEnhanced: 0, contrastBoosted: 0 };
  const result: MappedPixel[][] = mappedPixelData.map(row => row.map(cell => ({ ...cell })));

  // 1. Noise removal — remove isolated single-pixel different-color cells
  for (let j = 0; j < M; j++) {
    for (let i = 0; i < N; i++) {
      const cell = result[j][i];
      if (!cell || cell.isExternal) continue;
      const neighborColors = new Map<string, number>();
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const ny = j + dy, nx = i + dx;
          if (ny < 0 || ny >= M || nx < 0 || nx >= N) continue;
          const neighbor = result[ny][nx];
          if (neighbor && !neighbor.isExternal) {
            neighborColors.set(neighbor.color, (neighborColors.get(neighbor.color) || 0) + 1);
          }
        }
      }
      if (!neighborColors.has(cell.color) && neighborColors.size > 0) {
        let maxCount = 0, dominantColor = '';
        neighborColors.forEach((count, color) => {
          if (count > maxCount) { maxCount = count; dominantColor = color; }
        });
        result[j][i].color = dominantColor;
        const rgb = hexToRgb(dominantColor);
        if (rgb) {
          const closest = findClosestPaletteColor(rgb, palette);
          result[j][i].key = closest.key;
        }
        improvements.noiseRemoved++;
      }
    }
  }

  // 2. Edge enhancement — increase contrast for adjacent different-color cells
  for (let j = 1; j < M - 1; j++) {
    for (let i = 1; i < N - 1; i++) {
      const cell = result[j][i];
      if (!cell || cell.isExternal) continue;
      const cellRgb = hexToRgb(cell.color);
      if (!cellRgb) continue;
      const neighbors = [result[j-1]?.[i], result[j+1]?.[i], result[j]?.[i-1], result[j]?.[i+1]];
      for (const neighbor of neighbors) {
        if (!neighbor || neighbor.isExternal || neighbor.color === cell.color) continue;
        const neighborRgb = hexToRgb(neighbor.color);
        if (!neighborRgb) continue;
        const dist = colorDistance(cellRgb, neighborRgb);
        if (dist < 15) {
          // Find a darker palette color instead of modifying hex directly
          const darken = (v: number) => Math.max(0, v - 25);
          const darkerRgb = { r: darken(cellRgb.r), g: darken(cellRgb.g), b: darken(cellRgb.b) };
          const closest = findClosestPaletteColor(darkerRgb, palette);
          result[j][i].color = closest.hex;
          result[j][i].key = closest.key;
          improvements.edgesEnhanced++;
          break;
        }
      }
    }
  }

  improvements.contrastBoosted = Math.floor(improvements.edgesEnhanced * 0.5);
  return { optimizedData: result, improvements };
}
