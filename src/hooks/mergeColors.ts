import { MappedPixel, PaletteColor } from '@/types/pixelation';
import { colorDistance } from '@/utils/pixelation';

/**
 * Merge similar colors by frequency — the SAME algorithm from the reference project.
 * This is the key step that makes pixel art look clean and smooth.
 *
 * Strategy: sort colors by how many pixels use them (most-used first).
 * For each dominant color, find any lower-frequency colors whose Oklab
 * color distance is less than `threshold`. Merge them all into the dominant.
 *
 * The reference project uses threshold default 30 with granularity 50.
 * Higher threshold = more aggressive merging = fewer colors, smoother image.
 */
export function mergeSimilarColors(
  data: MappedPixel[][],
  M: number,
  N: number,
  palette: PaletteColor[],
  threshold: number,
): MappedPixel[][] {
  if (threshold <= 0) return data;

  // Build lookup: key → rgb and key → hex
  const keyToRgb = new Map<string, { r: number; g: number; b: number }>();
  const keyToHex = new Map<string, { key: string; hex: string }>();
  for (const p of palette) {
    keyToRgb.set(p.key, p.rgb);
    keyToHex.set(p.key, { key: p.key, hex: p.hex });
  }

  // Count frequencies
  const freq = new Map<string, number>();
  for (let j = 0; j < M; j++)
    for (let i = 0; i < N; i++) {
      const cell = data[j][i];
      if (cell && !cell.isExternal) freq.set(cell.key, (freq.get(cell.key) || 0) + 1);
    }

  // Sort by frequency descending
  const sorted = [...freq.entries()].sort((a, b) => b[1] - a[1]).map(e => e[0]);

  const result = data.map(row => row.map(cell => ({ ...cell, isExternal: cell.isExternal ?? false })));
  const replaced = new Set<string>();

  for (let i = 0; i < sorted.length; i++) {
    const domKey = sorted[i];
    if (replaced.has(domKey)) continue;
    const domRgb = keyToRgb.get(domKey);
    if (!domRgb) continue;

    for (let j = i + 1; j < sorted.length; j++) {
      const minorKey = sorted[j];
      if (replaced.has(minorKey)) continue;
      const minorRgb = keyToRgb.get(minorKey);
      if (!minorRgb) continue;

      const dist = colorDistance(domRgb, minorRgb);
      if (dist < threshold) {
        replaced.add(minorKey);
        const dom = keyToHex.get(domKey);
        if (!dom) continue;
        for (let r = 0; r < M; r++)
          for (let c = 0; c < N; c++)
            if (result[r][c].key === minorKey && !result[r][c].isExternal)
              result[r][c] = { key: dom.key, color: dom.hex, isExternal: false };
      }
    }
  }

  return result;
}
