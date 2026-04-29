export type ElementType = 'text' | 'image' | 'shape';
export type ShapeType = 'rectangle' | 'circle' | 'line' | 'triangle';
export type CanvasFilter = 'none' | 'warm' | 'cool' | 'bw' | 'fade' | 'vivid';
export type TextAlign = 'left' | 'center' | 'right' | 'justify';
export type ToolName = 'select' | 'move' | 'text' | 'image' | 'shape' | 'ai';

export interface BaseElement {
  id: string;
  type: ElementType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
  zIndex: number;
}

export interface TextElement extends BaseElement {
  type: 'text';
  content: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: 400 | 700;
  italic: boolean;
  underline: boolean;
  color: string;
  textAlign: TextAlign;
  lineHeight: number;
  letterSpacing: number;
}

export interface ImageElement extends BaseElement {
  type: 'image';
  url: string;
  filter: CanvasFilter;
  borderRadius: number;
  shadow: boolean;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
}

export interface ShapeElement extends BaseElement {
  type: 'shape';
  shape: ShapeType;
  fill: string;
  stroke: string;
  strokeWidth: number;
  borderRadius: number;
}

export type CanvasElement = TextElement | ImageElement | ShapeElement;

export interface CanvasPreset {
  id: string;
  label: string;
  width: number;
  height: number;
}

export interface CanvasState {
  version: number;
  canvasSize: { width: number; height: number };
  background: string;
  backgroundImage: string | null;
  showGrid: boolean;
  showRulers: boolean;
  elements: CanvasElement[];
  caption: string;
}

export const CANVAS_PRESETS: CanvasPreset[] = [
  { id: 'instagram-post', label: 'Instagram Post', width: 1080, height: 1080 },
  { id: 'instagram-story', label: 'Instagram Story', width: 1080, height: 1920 },
  { id: 'linkedin-post', label: 'LinkedIn Post', width: 1200, height: 627 },
  { id: 'twitter-post', label: 'Twitter / X Post', width: 1600, height: 900 }
];

export const FONT_FAMILIES = ['Inter', 'Roboto', 'Playfair Display', 'Montserrat'];

export const FILTER_PRESETS: { id: CanvasFilter; label: string; css: string }[] = [
  { id: 'none', label: 'None', css: 'none' },
  { id: 'warm', label: 'Warm', css: 'sepia(0.3) saturate(1.2) hue-rotate(-10deg)' },
  { id: 'cool', label: 'Cool', css: 'saturate(1.1) hue-rotate(15deg) brightness(1.05)' },
  { id: 'bw', label: 'B&W', css: 'grayscale(1) contrast(1.05)' },
  { id: 'fade', label: 'Fade', css: 'contrast(0.85) brightness(1.05) saturate(0.7)' },
  { id: 'vivid', label: 'Vivid', css: 'saturate(1.6) contrast(1.1)' }
];

export const PALETTE_COLORS = [
  '#1a1d1f',
  '#4a6268',
  '#5BA6A6',
  '#E53E3E',
  '#D69E2E',
  '#38A169',
  '#3182CE',
  '#805AD5',
  '#FF6B6B',
  '#FFFFFF'
];
