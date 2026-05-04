import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EditorStore } from '../../editor-store.service';
import { CanvasElement } from '../../editor-types';

@Component({
  selector: 'app-layers-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './layers-panel.component.html',
  styleUrl: './layers-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LayersPanelComponent {
  protected readonly store = inject(EditorStore);
  protected readonly collapsed = signal(false);
  protected readonly editingNameId = signal<string | null>(null);

  protected readonly layers = computed(() => [...this.store.elements()].reverse());

  private dragId: string | null = null;

  toggleCollapsed(): void {
    this.collapsed.update((v) => !v);
  }

  selectLayer(layer: CanvasElement, event: MouseEvent): void {
    if (event.shiftKey) {
      this.store.toggleSelection(layer.id);
    } else {
      this.store.selectOne(layer.id);
    }
  }

  toggleVisibility(layer: CanvasElement, event: MouseEvent): void {
    event.stopPropagation();
    this.store.updateElement(layer.id, { visible: !layer.visible });
  }

  toggleLock(layer: CanvasElement, event: MouseEvent): void {
    event.stopPropagation();
    this.store.updateElement(layer.id, { locked: !layer.locked });
  }

  startEditingName(layer: CanvasElement, event: MouseEvent): void {
    event.stopPropagation();
    this.editingNameId.set(layer.id);
  }

  saveName(layer: CanvasElement, value: string): void {
    this.store.updateElement(layer.id, { name: value || layer.type });
    this.editingNameId.set(null);
  }

  deleteLayer(layer: CanvasElement, event: MouseEvent): void {
    event.stopPropagation();
    this.store.deleteElement(layer.id);
  }

  onDragStart(layer: CanvasElement, event: DragEvent): void {
    this.dragId = layer.id;
    event.dataTransfer?.setData('text/plain', layer.id);
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
  }

  onDrop(target: CanvasElement, event: DragEvent): void {
    event.preventDefault();
    if (!this.dragId || this.dragId === target.id) return;
    const sorted = [...this.store.elements()];
    const targetIdx = sorted.findIndex((e) => e.id === target.id);
    if (targetIdx === -1) return;
    this.store.reorderLayer(this.dragId, targetIdx);
    this.dragId = null;
  }

  iconFor(layer: CanvasElement): string {
    if (layer.type === 'text') return 'T';
    if (layer.type === 'image') return '🖼';
    return '◇';
  }
}
