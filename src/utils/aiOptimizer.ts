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

/**
 * AI Optimize: light noise removal without color merging.
 * Only removes truly isolated pixels (surrounded by entirely different colors).
 * Does NOT merge similar colors — that blurs pixel art.
 */
export function aiOptimize(params: AiOptimizeParams): AiOptimizeResult {
  const { mappedPixelData, gridDimensions, palette } = params;
  const { N, M } = gridDimensions;
  const improvements = { noiseRemoved: 0, edgesEnhanced: 0, contrastBoosted: 0 };

  const result: MappedPixel[][] = mappedPixelData.map(row => row.map(cell => ({ ...cell })));

  for (let j = 0; j < M; j++) {
    for (let i = 0; i < N; i++) {
      const cell = result[j][i];
      if (!cell || cell.isExternal) continue;

      // Count neighbor colors (4-connected only)
      const neighborKeys = new Map<string, number>();
      for (const [dy, dx] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        const ny = j + dy, nx = i + dx;
        if (ny < 0 || ny >= M || nx < 0 || nx >= N) continue;
        const n = result[ny][nx];
        if (n && !n.isExternal) {
          neighborKeys.set(n.key, (neighborKeys.get(n.key) || 0) + 1);
        }
      }

      // Isolated pixel: none of the neighbors have the same color
      if (!neighborKeys.has(cell.key) && neighborKeys.size > 0) {
        let bestKey = '', bestCount = 0;
        neighborKeys.forEach((c, k) => { if (c > bestCount) { bestCount = c; bestKey = k; } });
        const best = palette.find(p => p.key === bestKey);
        if (best) {
          result[j][i] = { key: best.key, color: best.hex, isExternal: false };
          improvements.noiseRemoved++;
        }
      }
    }
  }

  return { optimizedData: result, improvements };
}
