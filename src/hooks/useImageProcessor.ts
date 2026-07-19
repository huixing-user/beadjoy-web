'use client';

import { useState, useCallback, useRef } from 'react';
import { EditorMode, ColorSystem, PaletteColor, MappedPixel, ColorCount, ProcessingState } from '@/types/pixelation';
import { calculatePixelGrid, hexToRgb } from '@/utils/pixelation';
import { aiOptimize } from '@/utils/aiOptimizer';
import { mergeSimilarColors } from './mergeColors';
import colorSystemMapping from '@/utils/colorSystemMapping.json';

const DEFAULT_GRANULARITY = 200;  // higher default = more detail
const DEFAULT_THRESHOLD = 0;  // Start with no merging — user can increase
const BG_HEXES = new Set(['#FFFFFF','#FEFEFE','#FDFDFD','#FCFCFC','#FAFAFA','#F5F5F5','#EEEEEE','#E8E8E8']);

function buildPalette(_colorSystem: ColorSystem): PaletteColor[] {
  const mapping = colorSystemMapping as Record<string, Record<string, string>>;
  const seen = new Set<string>();
  return Object.entries(mapping)
    .map(([hex]) => {
      const upper = hex.toUpperCase();
      if (seen.has(upper)) return null;
      seen.add(upper);
      const rgb = hexToRgb(upper);
      if (!rgb) return null;
      return { key: upper, hex: upper, rgb };
    })
    .filter((c): c is PaletteColor => c !== null);
}

function removeBackground(data: MappedPixel[][], M: number, N: number): MappedPixel[][] {
  const result = data.map(row => row.map(cell => ({ ...cell })));
  const visited = Array.from({ length: M }, () => Array(N).fill(false));
  const queue: [number, number][] = [];

  for (let i = 0; i < N; i++) {
    const c = result[0]?.[i]; if (c && BG_HEXES.has(c.color.toUpperCase())) queue.push([0, i]);
    const lc = result[M - 1]?.[i]; if (lc && BG_HEXES.has(lc.color.toUpperCase())) queue.push([M - 1, i]);
  }
  for (let j = 0; j < M; j++) {
    const c = result[j]?.[0]; if (c && BG_HEXES.has(c.color.toUpperCase())) queue.push([j, 0]);
    const lc = result[j]?.[N - 1]; if (lc && BG_HEXES.has(lc.color.toUpperCase())) queue.push([j, N - 1]);
  }

  while (queue.length > 0) {
    const [j, i] = queue.shift()!;
    if (j < 0 || j >= M || i < 0 || i >= N || visited[j][i]) continue;
    const cell = result[j]?.[i];
    if (!cell || !BG_HEXES.has(cell.color.toUpperCase())) continue;
    visited[j][i] = true;
    cell.isExternal = true;
    queue.push([j - 1, i], [j + 1, i], [j, i - 1], [j, i + 1]);
  }
  return result;
}

export function useImageProcessor() {
  const [state, setState] = useState<ProcessingState>({
    mappedPixelData: null, gridDimensions: null, colorCounts: null, totalBeadCount: 0,
    mode: 'quick', granularity: DEFAULT_GRANULARITY, similarityThreshold: DEFAULT_THRESHOLD,
    selectedColorSystem: 'MARD', paletteSize: 168, maxGridW: 200, maxGridH: 200,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const originalImageRef = useRef<HTMLImageElement | null>(null);

  const compute = useCallback((imageElement: HTMLImageElement, overrides?: { mode?: EditorMode; granularity?: number; threshold?: number; maxGridW?: number; maxGridH?: number }) => {
    setIsProcessing(true);
    const mode = overrides?.mode ?? state.mode;
    const granularity = overrides?.granularity ?? state.granularity;
    const threshold = overrides?.threshold ?? state.similarityThreshold;
    const maxW = overrides?.maxGridW ?? state.maxGridW;
    const maxH = overrides?.maxGridH ?? state.maxGridH;

    const imgW = imageElement.naturalWidth;
    const imgH = imageElement.naturalHeight;
    // N and M are directly controlled by maxW and maxH
    // If they are equal to the default (200), use granularity and aspect ratio
    // Otherwise, use exact values set by the user
    const userSetW = overrides?.maxGridW !== undefined ? overrides.maxGridW : state.maxGridW;
    const userSetH = overrides?.maxGridH !== undefined ? overrides.maxGridH : state.maxGridH;

    let N: number, M: number;
    if (userSetW === 200 && userSetH === 200) {
      // Default: use granularity + aspect ratio
      N = Math.min(granularity, userSetW);
      M = Math.max(1, Math.round(N * (imgH / Math.max(1, imgW))));
    } else {
      // User has customized: use exact values
      N = userSetW;
      M = userSetH;
    }

    const canvas = document.createElement('canvas');
    canvas.width = imgW; canvas.height = imgH;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(imageElement, 0, 0);

    const palette = buildPalette(state.selectedColorSystem);
    const fallback: PaletteColor = palette[0] || { key: '?', hex: '#FFFFFF', rgb: { r: 255, g: 255, b: 255 } };

    // Step 1: Initial color mapping (dominant per cell)
    let data = calculatePixelGrid(ctx, imgW, imgH, N, M, palette, 'dominant' as any, fallback);
    // Step 2: Merge similar colors FIRST (match reference project order!)
    // Merge uses key-based lookups which need the raw pixelGrid keys
    if (threshold > 0) {
      data = mergeSimilarColors(data, M, N, palette, threshold);
    }
    // Step 3: Background removal AFTER merge (match reference project order)
    data = removeBackground(data, M, N);
    // Step 4: AI mode extra cleanup (light isolated-pixel removal)
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

    setState(prev => ({ ...prev, mappedPixelData: data, gridDimensions: { N, M }, colorCounts: counters, totalBeadCount: total, mode, granularity, similarityThreshold: threshold, maxGridW: maxW, maxGridH: maxH }));
    setIsProcessing(false);
  }, [state.mode, state.granularity, state.similarityThreshold, state.selectedColorSystem, state.maxGridW, state.maxGridH]);

  const setMode = useCallback((mode: EditorMode) => setState(p => ({ ...p, mode })), []);
  const setGranularity = useCallback((g: number) => setState(p => ({ ...p, granularity: g })), []);
  const setThreshold = useCallback((t: number) => setState(p => ({ ...p, similarityThreshold: t })), []);
  const setColorSystem = useCallback((cs: ColorSystem) => setState(p => ({ ...p, selectedColorSystem: cs })), []);
  const setMaxGridW = useCallback((w: number) => setState(p => ({ ...p, maxGridW: w })), []);
  const setMaxGridH = useCallback((h: number) => setState(p => ({ ...p, maxGridH: h })), []);

  return { state, isProcessing, processImage: compute, setMode, setGranularity, setThreshold, setColorSystem, setMaxGridW, setMaxGridH };
}
