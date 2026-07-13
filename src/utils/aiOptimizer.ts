import { MappedPixel, PaletteColor, RgbColor } from '@/types/pixelation';
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
 * Pre-process: merge similar colors by frequency (BFS region-based).
 * This is the KEY algorithm from the reference project that makes images look clean.
 * For each color (sorted by usage frequency, most-used first), find all pixels
 * using that color. For each pixel, BFS its 4-connected neighbors: if a neighbor's
 * color is close enough (distance < threshold and in the lower-frequency set),
 * absorb that whole cell into the current dominant color's region.
 */
function mergeColorsByRegion(
  data: MappedPixel[][],
  M: number,
  N: number,
  palette: PaletteColor[],
  threshold: number,
): { merged: MappedPixel[][]; replacements: number } {
  // Build lookup maps
  const keyToRgb = new Map<string, RgbColor>();
  const keyToHex = new Map<string, { key: string; hex: string }>();
  for (const p of palette) {
    keyToRgb.set(p.key, p.rgb);
    keyToHex.set(p.key, { key: p.key, hex: p.hex });
  }

  // Count color frequencies (by key, not hex, for palette mapping)
  const freq = new Map<string, number>();
  for (let j = 0; j < M; j++) {
    for (let i = 0; i < N; i++) {
      const cell = data[j][i];
      if (cell && !cell.isExternal) freq.set(cell.key, (freq.get(cell.key) || 0) + 1);
    }
  }

  // Sort colors by frequency descending
  const sorted = [...freq.entries()].sort((a, b) => b[1] - a[1]).map(e => e[0]);

  const result = data.map(row => row.map(cell => ({ ...cell, isExternal: cell.isExternal ?? false })));
  const replaced = new Set<string>();
  let replacementCount = 0;

  for (let i = 0; i < sorted.length; i++) {
    const dominantKey = sorted[i];
    if (replaced.has(dominantKey)) continue;
    const dominantRgb = keyToRgb.get(dominantKey);
    if (!dominantRgb) continue;

    for (let j = i + 1; j < sorted.length; j++) {
      const minorKey = sorted[j];
      if (replaced.has(minorKey)) continue;
      const minorRgb = keyToRgb.get(minorKey);
      if (!minorRgb) continue;

      const dist = colorDistance(dominantRgb, minorRgb);
      if (dist < threshold) {
        replaced.add(minorKey);
        // Replace all cells with minorKey
        for (let r = 0; r < M; r++) {
          for (let c = 0; c < N; c++) {
            if (result[r][c].key === minorKey && !result[r][c].isExternal) {
              const dom = keyToHex.get(dominantKey);
              if (dom) {
                result[r][c] = { key: dom.key, color: dom.hex, isExternal: false };
                replacementCount++;
              }
            }
          }
        }
      }
    }
  }

  return { merged: result, replacements: replacementCount };
}

export function aiOptimize(params: AiOptimizeParams): AiOptimizeResult {
  const { mappedPixelData, gridDimensions, palette } = params;
  const { N, M } = gridDimensions;
  const improvements = { noiseRemoved: 0, edgesEnhanced: 0, contrastBoosted: 0 };

  // Step 1: Merge similar colors by frequency (the critical step!)
  const { merged, replacements } = mergeColorsByRegion(mappedPixelData, M, N, palette, 25);
  improvements.noiseRemoved = replacements;

  // Step 2: Clean isolated pixels (noise removal)
  const result: MappedPixel[][] = merged.map(row => row.map(cell => ({ ...cell })));
  for (let j = 0; j < M; j++) {
    for (let i = 0; i < N; i++) {
      const cell = result[j][i];
      if (!cell || cell.isExternal) continue;

      // Count neighbor colors
      const neighborKeys = new Map<string, number>();
      for (const [dy, dx] of [[-1,0],[1,0],[0,-1],[0,1]]) {
        const ny = j + dy, nx = i + dx;
        if (ny < 0 || ny >= M || nx < 0 || nx >= N) continue;
        const n = result[ny][nx];
        if (n && !n.isExternal) neighborKeys.set(n.key, (neighborKeys.get(n.key) || 0) + 1);
      }

      // If current cell's color doesn't appear in neighbors → isolated, replace
      if (!neighborKeys.has(cell.key) && neighborKeys.size > 0) {
        let bestKey = ''; let bestCount = 0;
        neighborKeys.forEach((c, k) => { if (c > bestCount) { bestCount = c; bestKey = k; } });
        const best = palette.find(p => p.key === bestKey);
        if (best) { result[j][i] = { key: best.key, color: best.hex, isExternal: false }; improvements.noiseRemoved++; }
      }
    }
  }

  return { optimizedData: result, improvements };
}
