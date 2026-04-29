import { ChangeDetectionStrategy, Component, EventEmitter, Output, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EditorStore } from '../../editor-store.service';
import { EditorAiService, CaptionSuggestion } from '../../editor-ai.service';

interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
  suggestions?: CaptionSuggestion[];
}

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-assistant.component.html',
  styleUrl: './ai-assistant.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AiAssistantComponent {
  protected readonly store = inject(EditorStore);
  private readonly ai = inject(EditorAiService);

  protected readonly messages = signal<ChatMessage[]>([
    { role: 'ai', text: "Hi! I'm your post assistant. Ask me to rewrite the headline, suggest captions, or generate ideas." }
  ]);
  protected readonly inputValue = signal('');
  protected readonly busy = signal(false);

  @Output() readonly close = new EventEmitter<void>();
  @Output() readonly applyCaption = new EventEmitter<string>();

  protected readonly canSend = computed(() => this.inputValue().trim().length > 0 && !this.busy());

  protected onInput(value: string): void {
    this.inputValue.set(value);
  }

  protected onSubmit(): void {
    const value = this.inputValue().trim();
    if (!value || this.busy()) return;
    this.messages.update((m) => [...m, { role: 'user', text: value }]);
    this.inputValue.set('');
    this.busy.set(true);

    const wantsCaptions = /caption|headline|tagline/i.test(value);

    if (wantsCaptions) {
      this.ai.suggestCaptions(value).subscribe((suggestions) => {
        this.messages.update((m) => [
          ...m,
          { role: 'ai', text: 'Here are 3 captions you can try — click one to use it:', suggestions }
        ]);
        this.busy.set(false);
      });
    } else {
      this.ai.reply(value).subscribe((text) => {
        this.messages.update((m) => [...m, { role: 'ai', text }]);
        this.busy.set(false);
      });
    }
  }

  protected applySuggestion(s: CaptionSuggestion): void {
    this.applyCaption.emit(s.text);
    this.messages.update((m) => [
      ...m,
      { role: 'ai', text: `✓ Applied "${s.text.slice(0, 32)}…" to your caption.` }
    ]);
  }

  protected onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSubmit();
    }
  }
}
