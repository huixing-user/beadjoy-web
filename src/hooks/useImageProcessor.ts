'use client';

import { useState, useCallback, useRef } from 'react';
import { EditorMode, ColorSystem, PaletteColor, MappedPixel, GridDimensions, ColorCount, ProcessingState } from '@/types/pixelation';
import { calculatePixelGrid, hexToRgb, findClosestPaletteColor, colorDistance } from '@/utils/pixelation';
import { aiOptimize } from '@/utils/aiOptimizer';
import colorSystemMapping from '@/utils/colorSystemMapping.json';

const DEFAULT_GRANULARITY = 50;
const DEFAULT_THRESHOLD = 30;
const BG_HEXES = new Set(['#FFFFFF','#FEFEFE','#FDFDFD','#FCFCFC','#FAFAFA','#F5F5F5','#EEEEEE','#E8E8E8']);

function buildPalette(colorSystem: ColorSystem, excludeHexes: Set<string> = new Set()): PaletteColor[] {
  const mapping = colorSystemMapping as Record<string, Record<string, string>>;
  return Object.entries(mapping)
    .filter(([hex]) => !excludeHexes.has(hex))
    .map(([hex, m]) => {
      const rgb = hexToRgb(hex);
      if (!rgb) return null;
      return { key: m[colorSystem] || m.MARD, hex, rgb };
    })
    .filter((c): c is PaletteColor => c !== null);
}

function removeBackground(data: MappedPixel[][], M: number, N: number): MappedPixel[][] {
  const result = data.map(row => row.map(cell => ({ ...cell })));
  const visited = Array.from({ length: M }, () => Array(N).fill(false));
  const queue: [number, number][] = [];

  for (let i = 0; i < N; i++) {
    const c = result[0][i]; if (c && BG_HEXES.has(c.color.toUpperCase())) queue.push([0, i]);
    const lc = result[M - 1]?.[i]; if (lc && BG_HEXES.has(lc.color.toUpperCase())) queue.push([M - 1, i]);
  }
  for (let j = 0; j < M; j++) {
    const c = result[j][0]; if (c && BG_HEXES.has(c.color.toUpperCase())) queue.push([j, 0]);
    const lc = result[j]?.[N - 1]; if (lc && BG_HEXES.has(lc.color.toUpperCase())) queue.push([j, N - 1]);
  }

  while (queue.length > 0) {
    const [j, i] = queue.shift()!;
    if (j < 0 || j >= M || i < 0 || i >= N || visited[j][i]) continue;
    const cell = result[j][i];
    if (!cell || !BG_HEXES.has(cell.color.toUpperCase())) continue;
    visited[j][i] = true;
    cell.isExternal = true;
    queue.push([j - 1, i], [j + 1, i], [j, i - 1], [j, i + 1]);
  }
  return result;
}

/**
 * CRITICAL: Merge similar colors by frequency (same algorithm as reference project).
 * This is the key step that makes pixel art look clean — without it, every cell
 * maps to its own nearest palette color, creating a noisy "mosaic" effect.
 */
function mergeSimilarColors(
  data: MappedPixel[][],
  M: number,
  N: number,
  palette: PaletteColor[],
  threshold: number,
): MappedPixel[][] {
  // Build lookup tables
  const keyToRgb = new Map<string, { r: number; g: number; b: number }>();
  const keyToHex = new Map<string, string>();
  for (const p of palette) {
    keyToRgb.set(p.key, p.rgb);
    keyToHex.set(p.key, p.hex);
  }

  // Count color frequency
  const freq = new Map<string, number>();
  for (let j = 0; j < M; j++) {
    for (let i = 0; i < N; i++) {
      const cell = data[j][i];
      if (cell && !cell.isExternal) freq.set(cell.key, (freq.get(cell.key) || 0) + 1);
    }
  }

  const sorted = [...freq.entries()].sort((a, b) => b[1] - a[1]).map(e => e[0]);
  const result = data.map(row => row.map(cell => ({ ...cell, isExternal: cell.isExternal ?? false })));
  const replaced = new Set<string>();

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
        for (let r = 0; r < M; r++) {
          for (let c = 0; c < N; c++) {
            if (result[r][c].key === minorKey && !result[r][c].isExternal) {
              const hex = keyToHex.get(dominantKey) || '#FFFFFF';
              result[r][c] = { key: dominantKey, color: hex, isExternal: false };
            }
          }
        }
      }
    }
  }

  return result;
}

export function useImageProcessor() {
  const [state, setState] = useState<ProcessingState>({
    mappedPixelData: null, gridDimensions: null, colorCounts: null, totalBeadCount: 0,
    mode: 'quick', granularity: DEFAULT_GRANULARITY, similarityThreshold: DEFAULT_THRESHOLD,
    selectedColorSystem: 'MARD', paletteSize: 168,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const originalImageRef = useRef<HTMLImageElement | null>(null);

  const compute = useCallback((imageElement: HTMLImageElement, overrides?: { mode?: EditorMode; granularity?: number; threshold?: number }) => {
    setIsProcessing(true);
    const mode = overrides?.mode ?? state.mode;
    const granularity = overrides?.granularity ?? state.granularity;
    const threshold = overrides?.threshold ?? state.similarityThreshold;

    const imgW = imageElement.naturalWidth;
    const imgH = imageElement.naturalHeight;
    const N = granularity;
    const M = Math.max(1, Math.round(N * (imgH / imgW)));

    const canvas = document.createElement('canvas');
    canvas.width = imgW; canvas.height = imgH;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(imageElement, 0, 0);

    const palette = buildPalette(state.selectedColorSystem);
    const fallback: PaletteColor = palette[0] || { key: '?', hex: '#FFFFFF', rgb: { r: 255, g: 255, b: 255 } };

    let data = calculatePixelGrid(ctx, imgW, imgH, N, M, palette, 'dominant' as any, fallback);
    data = removeBackground(data, M, N);

    // Run merge-by-frequency (always, not just AI mode — this is the crucial quality step)
    data = mergeSimilarColors(data, M, N, palette, threshold);
    // AI mode adds extra cleanup
    if (mode === 'ai') {
      const result = aiOptimize({ mappedPixelData: data, gridDimensions: { N, M }, palette });
      data = result.optimizedData;
    }

    const counters: Record<string, ColorCount> = {};
    let total = 0;
    data.forEach(row => row.forEach(cell => {
      if (!cell || cell.isExternal) return;
      total++;
      const hex = cell.color.toUpperCase();
      if (!counters[hex]) counters[hex] = { count: 0, color: hex };
      counters[hex].count++;
    }));

    setState(prev => ({ ...prev, mappedPixelData: data, gridDimensions: { N, M }, colorCounts: counters, totalBeadCount: total, mode, granularity, similarityThreshold: threshold }));
    setIsProcessing(false);
  }, [state.mode, state.granularity, state.similarityThreshold, state.selectedColorSystem]);

  const setMode = useCallback((mode: EditorMode) => setState(p => ({ ...p, mode })), []);
  const setGranularity = useCallback((g: number) => setState(p => ({ ...p, granularity: g })), []);
  const setThreshold = useCallback((t: number) => setState(p => ({ ...p, similarityThreshold: t })), []);
  const setColorSystem = useCallback((cs: ColorSystem) => setState(p => ({ ...p, selectedColorSystem: cs })), []);

  return { state, isProcessing, processImage: compute, setMode, setGranularity, setThreshold, setColorSystem };
}
