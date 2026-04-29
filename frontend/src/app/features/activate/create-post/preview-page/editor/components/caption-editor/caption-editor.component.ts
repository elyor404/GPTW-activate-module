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
import { EditorStore } from '../../editor-store.service';

const EMOJI_PALETTE = [
  '😀', '😎', '🚀', '💡', '🎉', '🔥', '✨', '👏',
  '💪', '❤️', '🙌', '🌟', '📈', '🏆', '🤝', '🎯',
  '👋', '✅', '💼', '🌍'
];

const MAX_LENGTH = 2200;

@Component({
  selector: 'app-caption-editor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './caption-editor.component.html',
  styleUrl: './caption-editor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CaptionEditorComponent {
  protected readonly store = inject(EditorStore);
  protected readonly emojis = EMOJI_PALETTE;
  protected readonly maxLength = MAX_LENGTH;

  protected readonly toolbar = signal<{ x: number; y: number } | null>(null);
  protected readonly emojiOpen = signal(false);

  @ViewChild('editor', { static: true }) editorRef!: ElementRef<HTMLDivElement>;

  protected readonly caption = computed(() => this.store.state().caption);
  protected readonly charCount = computed(() => this.caption().length);
  protected readonly highlighted = computed(() => this.formatHtml(this.caption()));

  private skipNextSync = false;

  constructor() {
    effect(() => {
      const value = this.caption();
      if (this.skipNextSync) {
        this.skipNextSync = false;
        return;
      }
      const el = this.editorRef?.nativeElement;
      if (el && el.innerText !== value) {
        el.innerHTML = this.formatHtml(value);
      }
    });
  }

  ngAfterViewInit(): void {
    this.editorRef.nativeElement.innerHTML = this.formatHtml(this.caption());
  }

  protected onInput(event: Event): void {
    const text = (event.target as HTMLDivElement).innerText.slice(0, MAX_LENGTH);
    this.skipNextSync = true;
    this.store.setCaption(text);
  }

  protected onBlur(): void {
    this.store.commitCaption();
    setTimeout(() => this.toolbar.set(null), 150);
  }

  protected onSelect(): void {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
      this.toolbar.set(null);
      return;
    }
    const range = sel.getRangeAt(0);
    const editor = this.editorRef.nativeElement;
    if (!editor.contains(range.commonAncestorContainer)) {
      this.toolbar.set(null);
      return;
    }
    const rect = range.getBoundingClientRect();
    const editorRect = editor.getBoundingClientRect();
    this.toolbar.set({
      x: rect.left + rect.width / 2 - editorRect.left,
      y: rect.top - editorRect.top - 8
    });
  }

  protected exec(command: 'bold' | 'italic'): void {
    document.execCommand(command);
    this.editorRef.nativeElement.focus();
    this.syncFromDom();
  }

  protected insertLink(): void {
    const url = window.prompt('Enter URL', 'https://');
    if (!url) return;
    document.execCommand('createLink', false, url);
    this.syncFromDom();
  }

  protected toggleEmoji(): void {
    this.emojiOpen.update((v) => !v);
  }

  protected insertEmoji(emoji: string): void {
    this.editorRef.nativeElement.focus();
    document.execCommand('insertText', false, emoji);
    this.emojiOpen.set(false);
    this.syncFromDom();
  }

  private syncFromDom(): void {
    const text = this.editorRef.nativeElement.innerText.slice(0, MAX_LENGTH);
    this.skipNextSync = true;
    this.store.setCaption(text);
  }

  setText(value: string): void {
    const next = (value || '').slice(0, MAX_LENGTH);
    this.skipNextSync = false;
    this.store.setCaption(next);
    this.store.commitCaption();
  }

  private escapeHtml(input: string): string {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  private formatHtml(value: string): string {
    if (!value) return '';
    const escaped = this.escapeHtml(value);
    return escaped
      .replace(/(#[\w-]+)/g, '<span class="cap-tag">$1</span>')
      .replace(/(@[\w-]+)/g, '<span class="cap-mention">$1</span>')
      .replace(/\n/g, '<br/>');
  }

  @HostListener('document:click', ['$event'])
  onDocClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.cap-toolbar') && !target.closest('.cap-editor')) {
      this.toolbar.set(null);
      this.emojiOpen.set(false);
    }
  }
}
