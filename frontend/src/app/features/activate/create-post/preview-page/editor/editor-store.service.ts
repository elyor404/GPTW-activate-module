import { Injectable, computed, signal } from '@angular/core';
import {
  CANVAS_PRESETS,
  CanvasElement,
  CanvasState,
  ImageElement,
  ShapeElement,
  ShapeType,
  TextElement,
  ToolName
} from './editor-types';

const SCHEMA_VERSION = 1;
const HISTORY_LIMIT = 80;

const DEFAULT_STATE: CanvasState = {
  version: SCHEMA_VERSION,
  canvasSize: { width: 1080, height: 1080 },
  background: '#ffffff',
  backgroundImage: null,
  showGrid: false,
  showRulers: true,
  elements: [],
  caption: ''
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

@Injectable({ providedIn: 'root' })
export class EditorStore {
  private readonly _state = signal<CanvasState>(clone(DEFAULT_STATE));
  private readonly _selectedIds = signal<string[]>([]);
  private readonly _activeTool = signal<ToolName>('select');
  private readonly _zoom = signal(100);
  private readonly _showAiAssistant = signal(false);
  private readonly _showAiSidePanel = signal(false);

  private readonly history: CanvasState[] = [];
  private historyIndex = -1;
  private readonly _historyVersion = signal(0);

  readonly state = this._state.asReadonly();
  readonly elements = computed(() =>
    [...this._state().elements].sort((a, b) => a.zIndex - b.zIndex)
  );
  readonly selectedIds = this._selectedIds.asReadonly();
  readonly activeTool = this._activeTool.asReadonly();
  readonly zoom = this._zoom.asReadonly();
  readonly showAiAssistant = this._showAiAssistant.asReadonly();
  readonly showAiSidePanel = this._showAiSidePanel.asReadonly();

  readonly selectedElements = computed(() => {
    const ids = this._selectedIds();
    return this._state().elements.filter((e) => ids.includes(e.id));
  });

  readonly primarySelected = computed<CanvasElement | null>(() => {
    const list = this.selectedElements();
    return list.length > 0 ? list[0] : null;
  });

  readonly canUndo = computed(() => {
    this._historyVersion();
    return this.historyIndex > 0;
  });

  readonly canRedo = computed(() => {
    this._historyVersion();
    return this.historyIndex >= 0 && this.historyIndex < this.history.length - 1;
  });

  constructor() {
    this.commit('init');
  }

  private commit(_label: string): void {
    this.history.splice(this.historyIndex + 1);
    this.history.push(clone(this._state()));
    if (this.history.length > HISTORY_LIMIT) {
      this.history.shift();
    }
    this.historyIndex = this.history.length - 1;
    this._historyVersion.update((v) => v + 1);
  }

  private mutate(mutator: (draft: CanvasState) => void, commit = true): void {
    const draft = clone(this._state());
    mutator(draft);
    this._state.set(draft);
    if (commit) this.commit('mutate');
  }

  setActiveTool(tool: ToolName): void {
    this._activeTool.set(tool);
  }

  setZoom(value: number): void {
    this._zoom.set(Math.min(200, Math.max(25, Math.round(value))));
  }

  zoomIn(): void {
    this.setZoom(this._zoom() + 10);
  }

  zoomOut(): void {
    this.setZoom(this._zoom() - 10);
  }

  resetZoom(): void {
    this.setZoom(100);
  }

  toggleAiAssistant(value?: boolean): void {
    this._showAiAssistant.set(value ?? !this._showAiAssistant());
  }

  toggleAiSidePanel(value?: boolean): void {
    this._showAiSidePanel.set(value ?? !this._showAiSidePanel());
  }

  setSelection(ids: string[]): void {
    this._selectedIds.set([...new Set(ids)]);
  }

  selectOne(id: string): void {
    this._selectedIds.set([id]);
  }

  toggleSelection(id: string): void {
    const current = this._selectedIds();
    this._selectedIds.set(current.includes(id) ? current.filter((x) => x !== id) : [...current, id]);
  }

  selectAll(): void {
    this._selectedIds.set(this._state().elements.map((e) => e.id));
  }

  clearSelection(): void {
    this._selectedIds.set([]);
  }

  setCanvasSize(width: number, height: number): void {
    this.mutate((d) => {
      d.canvasSize = { width, height };
    });
  }

  applyPreset(presetId: string): void {
    const preset = CANVAS_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    this.setCanvasSize(preset.width, preset.height);
  }

  setBackground(color: string): void {
    this.mutate((d) => {
      d.background = color;
    });
  }

  setBackgroundImage(url: string | null): void {
    this.mutate((d) => {
      d.backgroundImage = url;
    });
  }

  setShowGrid(value: boolean): void {
    this.mutate((d) => {
      d.showGrid = value;
    });
  }

  setShowRulers(value: boolean): void {
    this.mutate((d) => {
      d.showRulers = value;
    });
  }

  setCaption(value: string): void {
    this.mutate((d) => {
      d.caption = value;
    }, false);
  }

  commitCaption(): void {
    this.commit('caption');
  }

  private nextZ(): number {
    const els = this._state().elements;
    return els.length === 0 ? 1 : Math.max(...els.map((e) => e.zIndex)) + 1;
  }

  addText(partial?: Partial<TextElement>): TextElement {
    const id = makeId('text');
    const z = this.nextZ();
    const el: TextElement = {
      id,
      type: 'text',
      name: 'Text',
      x: 80,
      y: 80,
      width: 320,
      height: 64,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      zIndex: z,
      content: 'New text',
      fontFamily: 'Inter',
      fontSize: 36,
      fontWeight: 700,
      italic: false,
      underline: false,
      color: '#1a1d1f',
      textAlign: 'left',
      lineHeight: 1.2,
      letterSpacing: 0,
      ...partial
    };
    this.mutate((d) => {
      d.elements.push(el);
    });
    this.selectOne(id);
    return el;
  }

  addImage(url: string, partial?: Partial<ImageElement>): ImageElement {
    const id = makeId('img');
    const z = this.nextZ();
    const el: ImageElement = {
      id,
      type: 'image',
      name: 'Image',
      x: 100,
      y: 100,
      width: 320,
      height: 320,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      zIndex: z,
      url,
      filter: 'none',
      borderRadius: 0,
      shadow: false,
      shadowBlur: 16,
      shadowOffsetX: 0,
      shadowOffsetY: 8,
      ...partial
    };
    this.mutate((d) => {
      d.elements.push(el);
    });
    this.selectOne(id);
    return el;
  }

  addShape(shape: ShapeType, partial?: Partial<ShapeElement>): ShapeElement {
    const id = makeId('shape');
    const z = this.nextZ();
    const el: ShapeElement = {
      id,
      type: 'shape',
      name: shape.charAt(0).toUpperCase() + shape.slice(1),
      x: 120,
      y: 120,
      width: shape === 'line' ? 240 : 200,
      height: shape === 'line' ? 4 : 200,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      zIndex: z,
      shape,
      fill: shape === 'line' ? '#4a6268' : '#5BA6A6',
      stroke: '#1a1d1f',
      strokeWidth: 0,
      borderRadius: shape === 'rectangle' ? 8 : 0,
      ...partial
    };
    this.mutate((d) => {
      d.elements.push(el);
    });
    this.selectOne(id);
    return el;
  }

  duplicateElement(id: string): CanvasElement | null {
    const el = this._state().elements.find((e) => e.id === id);
    if (!el) return null;
    const copy = clone(el) as CanvasElement;
    copy.id = makeId(el.type);
    copy.x += 24;
    copy.y += 24;
    copy.zIndex = this.nextZ();
    copy.name = `${el.name} copy`;
    this.mutate((d) => {
      d.elements.push(copy);
    });
    this.selectOne(copy.id);
    return copy;
  }

  duplicateSelected(): void {
    const ids = this._selectedIds();
    const newIds: string[] = [];
    ids.forEach((id) => {
      const c = this.duplicateElement(id);
      if (c) newIds.push(c.id);
    });
    if (newIds.length > 0) this.setSelection(newIds);
  }

  deleteElement(id: string): void {
    this.mutate((d) => {
      d.elements = d.elements.filter((e) => e.id !== id);
    });
  }

  deleteSelected(): void {
    const ids = this._selectedIds();
    if (ids.length === 0) return;
    this.mutate((d) => {
      d.elements = d.elements.filter((e) => !ids.includes(e.id));
    });
    this.clearSelection();
  }

  updateElement(id: string, patch: Partial<CanvasElement>, commit = true): void {
    this.mutate((d) => {
      const idx = d.elements.findIndex((e) => e.id === id);
      if (idx === -1) return;
      d.elements[idx] = { ...d.elements[idx], ...patch } as CanvasElement;
    }, commit);
  }

  updateSelected(patch: Partial<CanvasElement>, commit = true): void {
    const ids = this._selectedIds();
    if (ids.length === 0) return;
    this.mutate((d) => {
      d.elements = d.elements.map((e) =>
        ids.includes(e.id) ? ({ ...e, ...patch } as CanvasElement) : e
      );
    }, commit);
  }

  commitChange(): void {
    this.commit('change');
  }

  nudgeSelected(dx: number, dy: number): void {
    const ids = this._selectedIds();
    if (ids.length === 0) return;
    this.mutate((d) => {
      d.elements = d.elements.map((e) =>
        ids.includes(e.id) ? { ...e, x: e.x + dx, y: e.y + dy } : e
      );
    });
  }

  reorderLayer(id: string, newIndex: number): void {
    this.mutate((d) => {
      const sorted = [...d.elements].sort((a, b) => a.zIndex - b.zIndex);
      const target = sorted.find((e) => e.id === id);
      if (!target) return;
      const remaining = sorted.filter((e) => e.id !== id);
      remaining.splice(newIndex, 0, target);
      remaining.forEach((e, i) => {
        e.zIndex = i + 1;
      });
      d.elements = remaining;
    });
  }

  bringForward(id: string): void {
    const sorted = [...this._state().elements].sort((a, b) => a.zIndex - b.zIndex);
    const idx = sorted.findIndex((e) => e.id === id);
    if (idx === -1 || idx === sorted.length - 1) return;
    this.reorderLayer(id, idx + 1);
  }

  sendBackward(id: string): void {
    const sorted = [...this._state().elements].sort((a, b) => a.zIndex - b.zIndex);
    const idx = sorted.findIndex((e) => e.id === id);
    if (idx <= 0) return;
    this.reorderLayer(id, idx - 1);
  }

  undo(): void {
    if (!this.canUndo()) return;
    this.historyIndex--;
    this._state.set(clone(this.history[this.historyIndex]));
    this._historyVersion.update((v) => v + 1);
  }

  redo(): void {
    if (!this.canRedo()) return;
    this.historyIndex++;
    this._state.set(clone(this.history[this.historyIndex]));
    this._historyVersion.update((v) => v + 1);
  }

  serialize(): CanvasState {
    return clone(this._state());
  }

  loadState(state: CanvasState): void {
    this._state.set(clone(state));
    this.history.length = 0;
    this.historyIndex = -1;
    this.commit('load');
    this.clearSelection();
  }

  resetToDefaults(): void {
    this.loadState(clone(DEFAULT_STATE));
  }
}
