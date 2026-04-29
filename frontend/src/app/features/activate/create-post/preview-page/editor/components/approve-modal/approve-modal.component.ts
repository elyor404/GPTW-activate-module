import { ChangeDetectionStrategy, Component, EventEmitter, Output, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditorStore } from '../../editor-store.service';
import { CanvasElement, FILTER_PRESETS, ImageElement, ShapeElement, TextElement } from '../../editor-types';

@Component({
  selector: 'app-approve-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './approve-modal.component.html',
  styleUrl: './approve-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApproveModalComponent {
  protected readonly store = inject(EditorStore);

  @Output() readonly approve = new EventEmitter<void>();
  @Output() readonly cancel = new EventEmitter<void>();

  protected readonly state = this.store.state;
  protected readonly elements = this.store.elements;

  protected readonly thumbScale = computed(() => {
    const cs = this.state().canvasSize;
    const targetMax = 320;
    return Math.min(targetMax / cs.width, targetMax / cs.height);
  });

  protected asText(el: CanvasElement): TextElement {
    return el as TextElement;
  }
  protected asImage(el: CanvasElement): ImageElement {
    return el as ImageElement;
  }
  protected asShape(el: CanvasElement): ShapeElement {
    return el as ShapeElement;
  }
  protected getFilterCss(filter: ImageElement['filter']): string {
    return FILTER_PRESETS.find((f) => f.id === filter)?.css ?? 'none';
  }

  onBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.cancel.emit();
    }
  }
}
