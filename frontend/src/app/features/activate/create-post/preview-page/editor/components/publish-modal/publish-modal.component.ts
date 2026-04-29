import { ChangeDetectionStrategy, Component, EventEmitter, Output, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface PublishPayload {
  platforms: string[];
  publishNow: boolean;
  scheduledAt: string | null;
}

const PLATFORMS = [
  { id: 'linkedin', label: 'LinkedIn', color: '#0a66c2' },
  { id: 'twitter', label: 'Twitter / X', color: '#0f1419' },
  { id: 'instagram', label: 'Instagram', color: '#E1306C' },
  { id: 'facebook', label: 'Facebook', color: '#1877F2' }
];

@Component({
  selector: 'app-publish-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './publish-modal.component.html',
  styleUrl: './publish-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PublishModalComponent {
  protected readonly platforms = PLATFORMS;
  protected readonly selected = signal<Record<string, boolean>>({ linkedin: true });
  protected readonly mode = signal<'now' | 'schedule'>('now');
  protected readonly date = signal('');
  protected readonly time = signal('');

  @Output() readonly publish = new EventEmitter<PublishPayload>();
  @Output() readonly cancel = new EventEmitter<void>();

  protected readonly canPublish = computed(() => {
    const anySel = Object.values(this.selected()).some(Boolean);
    if (!anySel) return false;
    if (this.mode() === 'schedule') {
      return !!this.date() && !!this.time();
    }
    return true;
  });

  toggle(id: string): void {
    this.selected.update((v) => ({ ...v, [id]: !v[id] }));
  }

  setMode(mode: 'now' | 'schedule'): void {
    this.mode.set(mode);
  }

  onDate(value: string): void {
    this.date.set(value);
  }

  onTime(value: string): void {
    this.time.set(value);
  }

  submit(): void {
    if (!this.canPublish()) return;
    const ids = this.platforms.filter((p) => this.selected()[p.id]).map((p) => p.id);
    if (this.mode() === 'now') {
      this.publish.emit({ platforms: ids, publishNow: true, scheduledAt: null });
    } else {
      this.publish.emit({
        platforms: ids,
        publishNow: false,
        scheduledAt: `${this.date()}T${this.time()}`
      });
    }
  }

  onBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.cancel.emit();
  }
}
