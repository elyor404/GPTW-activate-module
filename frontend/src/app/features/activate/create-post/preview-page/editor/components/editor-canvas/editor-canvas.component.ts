import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  computed,
  effect,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EditorStore } from '../../editor-store.service';
import {
  CanvasElement,
  FILTER_PRESETS,
  ImageElement,
  ShapeElement,
  TextElement
} from '../../editor-types';

type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

interface DragSession {
  mode: 'move' | 'resize' | 'marquee' | 'pan';
  handle?: ResizeHandle;
  startClientX: number;
  startClientY: number;
  startElements: Map<string, CanvasElement>;
  startScrollX?: number;
  startScrollY?: number;
}

interface SnapLine {
  orientation: 'v' | 'h';
  position: number;
}

@Component({
  selector: 'app-editor-canvas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editor-canvas.component.html',
  styleUrl: './editor-canvas.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditorCanvasComponent {
  protected readonly store = inject(EditorStore);

  @ViewChild('viewport', { static: true }) viewportRef!: ElementRef<HTMLDivElement>;
  @ViewChild('scroll', { static: true }) scrollRef!: ElementRef<HTMLDivElement>;
  @ViewChild('stage', { static: true }) stageRef!: ElementRef<HTMLDivElement>;
  @ViewChild('imageInput') imageInputRef?: ElementRef<HTMLInputElement>;

  protected readonly editingId = signal<string | null>(null);
  protected readonly marquee = signal<{ x: number; y: number; w: number; h: number } | null>(null);
  protected readonly snapLines = signal<SnapLine[]>([]);

  protected readonly fitScale = signal(1);

  protected readonly canvasSize = computed(() => this.store.state().canvasSize);
  protected readonly background = computed(() => this.store.state().background);
  protected readonly showGrid = computed(() => this.store.state().showGrid);
  protected readonly showRulers = computed(() => this.store.state().showRulers);
  protected readonly elements = computed(() => this.store.elements());
  protected readonly selectedIds = computed(() => this.store.selectedIds());
  protected readonly displayScale = computed(() => (this.store.zoom() / 100) * this.fitScale());

  protected readonly rulerHTicks = computed(() => this.buildTicks(this.canvasSize().width));
  protected readonly rulerVTicks = computed(() => this.buildTicks(this.canvasSize().height));

  private session: DragSession | null = null;
  private suppressClick = false;

  constructor() {
    effect(() => {
      this.canvasSize();
      queueMicrotask(() => this.recomputeFit());
    });
  }

  ngAfterViewInit(): void {
    this.recomputeFit();
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.recomputeFit();
  }

  private recomputeFit(): void {
    const vp = this.viewportRef?.nativeElement;
    if (!vp) return;
    const padding = 80;
    const availW = vp.clientWidth - padding;
    const availH = vp.clientHeight - padding;
    const { width, height } = this.canvasSize();
    if (availW <= 0 || availH <= 0) return;
    const scale = Math.min(availW / width, availH / height, 1);
    this.fitScale.set(scale > 0 ? scale : 1);
  }

  private buildTicks(total: number): { px: number; major: boolean; label: string }[] {
    const step = total > 1500 ? 100 : 50;
    const ticks: { px: number; major: boolean; label: string }[] = [];
    for (let i = 0; i <= total; i += step) {
      ticks.push({
        px: i,
        major: i % (step * 2) === 0,
        label: i % (step * 2) === 0 ? `${i}` : ''
      });
    }
    return ticks;
  }

  protected getFilterCss(filter: ImageElement['filter']): string {
    return FILTER_PRESETS.find((f) => f.id === filter)?.css ?? 'none';
  }

  protected getElementShadow(el: ImageElement): string {
    if (!el.shadow) return 'none';
    return `${el.shadowOffsetX}px ${el.shadowOffsetY}px ${el.shadowBlur}px rgba(0,0,0,0.25)`;
  }

  protected asText(el: CanvasElement): TextElement {
    return el as TextElement;
  }
  protected asImage(el: CanvasElement): ImageElement {
    return el as ImageElement;
  }
  protected asShape(el: CanvasElement): ShapeElement {
    return el as ShapeElement;
  }

  protected onStageMouseDown(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.closest('.cv-element')) return;

    const tool = this.store.activeTool();
    if (tool === 'text') {
      const { x, y } = this.clientToCanvas(event.clientX, event.clientY);
      const el = this.store.addText({ x: Math.max(0, x - 100), y: Math.max(0, y - 20) });
      this.store.setActiveTool('select');
      this.beginEditingText(el.id);
      return;
    }

    if (tool === 'shape') {
      const { x, y } = this.clientToCanvas(event.clientX, event.clientY);
      this.store.addShape('rectangle', { x: Math.max(0, x - 100), y: Math.max(0, y - 100) });
      this.store.setActiveTool('select');
      return;
    }

    if (tool === 'image') {
      this.imageInputRef?.nativeElement.click();
      return;
    }

    if (tool === 'move') {
      this.beginPan(event);
      return;
    }

    this.store.clearSelection();
    this.editingId.set(null);
    this.beginMarquee(event);
  }

  protected onElementMouseDown(event: MouseEvent, el: CanvasElement): void {
    if (this.editingId() === el.id) return;
    if (el.locked) return;
    event.stopPropagation();
    if (event.shiftKey) {
      this.store.toggleSelection(el.id);
    } else if (!this.selectedIds().includes(el.id)) {
      this.store.selectOne(el.id);
    }
    this.beginMove(event);
  }

  protected onElementDoubleClick(event: MouseEvent, el: CanvasElement): void {
    if (el.type !== 'text' || el.locked) return;
    event.stopPropagation();
    this.beginEditingText(el.id);
  }

  protected onTextBlur(event: FocusEvent, el: TextElement): void {
    const html = (event.target as HTMLElement).innerText;
    this.store.updateElement(el.id, { content: html } as Partial<TextElement>);
    this.editingId.set(null);
  }

  private beginEditingText(id: string): void {
    this.editingId.set(id);
    this.store.selectOne(id);
    queueMicrotask(() => {
      const editable = this.stageRef.nativeElement.querySelector<HTMLElement>(
        `[data-text-edit="${id}"]`
      );
      if (editable) {
        editable.focus();
        const range = document.createRange();
        range.selectNodeContents(editable);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    });
  }

  protected onResizeHandleDown(event: MouseEvent, handle: ResizeHandle): void {
    event.stopPropagation();
    event.preventDefault();
    const ids = this.selectedIds();
    if (ids.length === 0) return;
    const map = new Map<string, CanvasElement>();
    this.elements()
      .filter((e) => ids.includes(e.id))
      .forEach((e) => map.set(e.id, JSON.parse(JSON.stringify(e))));
    this.session = {
      mode: 'resize',
      handle,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startElements: map
    };
  }

  private beginMove(event: MouseEvent): void {
    const ids = this.selectedIds();
    const map = new Map<string, CanvasElement>();
    this.elements()
      .filter((e) => ids.includes(e.id))
      .forEach((e) => map.set(e.id, JSON.parse(JSON.stringify(e))));
    this.session = {
      mode: 'move',
      startClientX: event.clientX,
      startClientY: event.clientY,
      startElements: map
    };
  }

  private beginMarquee(event: MouseEvent): void {
    const { x, y } = this.clientToCanvas(event.clientX, event.clientY);
    this.session = {
      mode: 'marquee',
      startClientX: x,
      startClientY: y,
      startElements: new Map()
    };
    this.marquee.set({ x, y, w: 0, h: 0 });
  }

  private beginPan(event: MouseEvent): void {
    const sc = this.scrollRef.nativeElement;
    this.session = {
      mode: 'pan',
      startClientX: event.clientX,
      startClientY: event.clientY,
      startElements: new Map(),
      startScrollX: sc.scrollLeft,
      startScrollY: sc.scrollTop
    };
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.session) return;
    this.suppressClick = true;
    const scale = this.displayScale();
    const dx = (event.clientX - this.session.startClientX) / scale;
    const dy = (event.clientY - this.session.startClientY) / scale;

    if (this.session.mode === 'move') {
      this.applyMove(dx, dy);
    } else if (this.session.mode === 'resize' && this.session.handle) {
      this.applyResize(dx, dy, this.session.handle);
    } else if (this.session.mode === 'marquee') {
      const cur = this.clientToCanvas(event.clientX, event.clientY);
      const x = Math.min(this.session.startClientX, cur.x);
      const y = Math.min(this.session.startClientY, cur.y);
      const w = Math.abs(cur.x - this.session.startClientX);
      const h = Math.abs(cur.y - this.session.startClientY);
      this.marquee.set({ x, y, w, h });
      this.applyMarqueeSelection({ x, y, w, h });
    } else if (this.session.mode === 'pan') {
      const sc = this.scrollRef.nativeElement;
      sc.scrollLeft = (this.session.startScrollX ?? 0) - (event.clientX - this.session.startClientX);
      sc.scrollTop = (this.session.startScrollY ?? 0) - (event.clientY - this.session.startClientY);
    }
  }

  @HostListener('window:mouseup')
  onMouseUp(): void {
    if (!this.session) return;
    if (this.session.mode === 'move' || this.session.mode === 'resize') {
      this.store.commitChange();
    }
    this.session = null;
    this.marquee.set(null);
    this.snapLines.set([]);
    setTimeout(() => (this.suppressClick = false), 0);
  }

  private applyMove(dx: number, dy: number): void {
    const ids = Array.from(this.session!.startElements.keys());
    const cs = this.canvasSize();
    const lines: SnapLine[] = [];

    let appliedDx = dx;
    let appliedDy = dy;

    if (ids.length === 1) {
      const start = this.session!.startElements.get(ids[0])!;
      const tentative = { x: start.x + dx, y: start.y + dy };
      const others = this.elements().filter((e) => !ids.includes(e.id));

      const targets: number[] = [0, cs.width / 2, cs.width];
      others.forEach((o) => {
        targets.push(o.x, o.x + o.width / 2, o.x + o.width);
      });
      const tCenters: number[] = [tentative.x, tentative.x + start.width / 2, tentative.x + start.width];
      let best: { snap: number; offset: number } | null = null;
      tCenters.forEach((tc, i) => {
        targets.forEach((tg) => {
          const diff = tg - tc;
          if (Math.abs(diff) <= 6 && (!best || Math.abs(diff) < Math.abs(best.offset))) {
            best = { snap: tg, offset: diff };
            void i;
          }
        });
      });
      if (best) {
        const b = best as { snap: number; offset: number };
        appliedDx = dx + b.offset;
        lines.push({ orientation: 'v', position: b.snap });
      }

      const targetsY: number[] = [0, cs.height / 2, cs.height];
      others.forEach((o) => {
        targetsY.push(o.y, o.y + o.height / 2, o.y + o.height);
      });
      const tCentersY: number[] = [tentative.y, tentative.y + start.height / 2, tentative.y + start.height];
      let bestY: { snap: number; offset: number } | null = null;
      tCentersY.forEach((tc) => {
        targetsY.forEach((tg) => {
          const diff = tg - tc;
          if (Math.abs(diff) <= 6 && (!bestY || Math.abs(diff) < Math.abs(bestY.offset))) {
            bestY = { snap: tg, offset: diff };
          }
        });
      });
      if (bestY) {
        const b = bestY as { snap: number; offset: number };
        appliedDy = dy + b.offset;
        lines.push({ orientation: 'h', position: b.snap });
      }
    }

    this.snapLines.set(lines);
    ids.forEach((id) => {
      const start = this.session!.startElements.get(id)!;
      this.store.updateElement(
        id,
        {
          x: Math.round(start.x + appliedDx),
          y: Math.round(start.y + appliedDy)
        } as Partial<CanvasElement>,
        false
      );
    });
  }

  private applyResize(dx: number, dy: number, handle: ResizeHandle): void {
    const ids = Array.from(this.session!.startElements.keys());
    ids.forEach((id) => {
      const start = this.session!.startElements.get(id)!;
      let { x, y, width, height } = start;
      if (handle.includes('e')) width = Math.max(10, start.width + dx);
      if (handle.includes('s')) height = Math.max(10, start.height + dy);
      if (handle.includes('w')) {
        width = Math.max(10, start.width - dx);
        x = start.x + (start.width - width);
      }
      if (handle.includes('n')) {
        height = Math.max(10, start.height - dy);
        y = start.y + (start.height - height);
      }
      const patch: Partial<CanvasElement> = {
        x: Math.round(x),
        y: Math.round(y),
        width: Math.round(width),
        height: Math.round(height)
      };
      if (start.type === 'text') {
        const ratio = height / start.height;
        if (ratio > 0.1 && (handle === 'nw' || handle === 'ne' || handle === 'sw' || handle === 'se')) {
          (patch as Partial<TextElement>).fontSize = Math.max(8, Math.round((start as TextElement).fontSize * ratio));
        }
      }
      this.store.updateElement(id, patch, false);
    });
  }

  private applyMarqueeSelection(rect: { x: number; y: number; w: number; h: number }): void {
    const hits = this.elements().filter((e) => {
      return (
        e.x < rect.x + rect.w &&
        e.x + e.width > rect.x &&
        e.y < rect.y + rect.h &&
        e.y + e.height > rect.y
      );
    });
    this.store.setSelection(hits.map((e) => e.id));
  }

  private clientToCanvas(clientX: number, clientY: number): { x: number; y: number } {
    const stage = this.stageRef.nativeElement.getBoundingClientRect();
    const scale = this.displayScale();
    return {
      x: (clientX - stage.left) / scale,
      y: (clientY - stage.top) / scale
    };
  }

  protected onImageFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      const img = new Image();
      img.onload = () => {
        const cs = this.canvasSize();
        const max = Math.min(cs.width, cs.height) * 0.6;
        const ratio = img.width / img.height;
        const w = ratio >= 1 ? max : max * ratio;
        const h = ratio >= 1 ? max / ratio : max;
        this.store.addImage(url, {
          width: w,
          height: h,
          x: (cs.width - w) / 2,
          y: (cs.height - h) / 2
        });
      };
      img.src = url;
    };
    reader.readAsDataURL(file);
    input.value = '';
    this.store.setActiveTool('select');
  }

  protected getCursorClass(): string {
    const tool = this.store.activeTool();
    return `tool-${tool}`;
  }

  protected handleClass(handle: ResizeHandle): string {
    return `handle handle-${handle}`;
  }

  async captureImage(): Promise<string> {
    const stage = this.stageRef?.nativeElement;
    if (!stage) return '';

    // Dynamically import html2canvas to avoid any SSR/initial load issues
    const html2canvas = (await import('html2canvas')).default;

    try {
      // Temporarily clear selection to avoid handles/borders in the screenshot
      const currentSelection = this.store.selectedIds();
      this.store.clearSelection();

      const canvas = await html2canvas(stage, {
        useCORS: true,
        backgroundColor: null, // Preserve transparency if any
        scale: 2, // Higher quality
        logging: false
      });

      // Restore selection
      if (currentSelection.length > 0) {
        this.store.setSelection(currentSelection);
      }

      return canvas.toDataURL('image/png');
    } catch (err) {
      console.error('Failed to capture canvas:', err);
      return '';
    }
  }
}
