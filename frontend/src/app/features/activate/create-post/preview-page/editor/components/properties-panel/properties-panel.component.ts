import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EditorStore } from '../../editor-store.service';
import {
  CANVAS_PRESETS,
  CanvasElement,
  FILTER_PRESETS,
  FONT_FAMILIES,
  ImageElement,
  PALETTE_COLORS,
  ShapeElement,
  TextAlign,
  TextElement
} from '../../editor-types';

@Component({
  selector: 'app-properties-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './properties-panel.component.html',
  styleUrl: './properties-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PropertiesPanelComponent {
  protected readonly store = inject(EditorStore);
  protected readonly fontFamilies = FONT_FAMILIES;
  protected readonly filters = FILTER_PRESETS;
  protected readonly presets = CANVAS_PRESETS;
  protected readonly palette = PALETTE_COLORS;
  protected readonly aligns: TextAlign[] = ['left', 'center', 'right', 'justify'];

  @ViewChild('replaceInput') replaceInputRef?: ElementRef<HTMLInputElement>;

  protected readonly selected = this.store.primarySelected;
  protected readonly multiSelect = computed(() => this.store.selectedElements().length > 1);

  protected asText(el: CanvasElement | null): TextElement | null {
    return el && el.type === 'text' ? (el as TextElement) : null;
  }
  protected asImage(el: CanvasElement | null): ImageElement | null {
    return el && el.type === 'image' ? (el as ImageElement) : null;
  }
  protected asShape(el: CanvasElement | null): ShapeElement | null {
    return el && el.type === 'shape' ? (el as ShapeElement) : null;
  }

  protected updateSelected(patch: Partial<CanvasElement>, commit = true): void {
    this.store.updateSelected(patch, commit);
  }

  protected toggleBold(): void {
    const t = this.asText(this.selected());
    if (!t) return;
    this.updateSelected({ fontWeight: t.fontWeight === 700 ? 400 : 700 } as Partial<TextElement>);
  }

  protected toggleItalic(): void {
    const t = this.asText(this.selected());
    if (!t) return;
    this.updateSelected({ italic: !t.italic } as Partial<TextElement>);
  }

  protected toggleUnderline(): void {
    const t = this.asText(this.selected());
    if (!t) return;
    this.updateSelected({ underline: !t.underline } as Partial<TextElement>);
  }

  protected setAlign(align: TextAlign): void {
    this.updateSelected({ textAlign: align } as Partial<TextElement>);
  }

  protected applyFilter(id: ImageElement['filter']): void {
    this.updateSelected({ filter: id } as Partial<ImageElement>);
  }

  protected onReplaceImageClick(): void {
    this.replaceInputRef?.nativeElement.click();
  }

  protected onReplaceImage(event: Event): void {
    const sel = this.asImage(this.selected());
    if (!sel) return;
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.updateSelected({ url: reader.result as string } as Partial<ImageElement>);
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  protected applyPreset(id: string): void {
    this.store.applyPreset(id);
  }

  protected toPercent(value: number): number {
    return Math.round(value * 100);
  }

  protected fromPercent(value: number): number {
    return value / 100;
  }

  protected onOpacityChange(value: string): void {
    const num = Number(value);
    this.updateSelected({ opacity: this.fromPercent(num) } as Partial<CanvasElement>);
  }

  protected stepFontSize(current: number, delta: number): void {
    const next = Math.max(8, Math.min(400, current + delta));
    this.updateSelected({ fontSize: next } as Partial<TextElement>);
  }
}
