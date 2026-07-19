export type ColorSystem = 'MARD' | 'COCO' | '漫漫' | '盼盼' | '咪小窝';
export type EditorMode = 'quick' | 'ai' | 'manual';

export interface RgbColor { r: number; g: number; b: number; }

export interface PaletteColor { key: string; hex: string; rgb: RgbColor; }

export interface MappedPixel { key: string; color: string; isExternal?: boolean; }

export interface GridDimensions { N: number; M: number; }

export interface ColorCount { count: number; color: string; }

export interface ProcessingState {
  mappedPixelData: MappedPixel[][] | null;
  gridDimensions: GridDimensions | null;
  colorCounts: Record<string, ColorCount> | null;
  totalBeadCount: number;
  mode: EditorMode;
  granularity: number;
  similarityThreshold: number;
  selectedColorSystem: ColorSystem;
  paletteSize: number;
  maxGrid: number;
}
