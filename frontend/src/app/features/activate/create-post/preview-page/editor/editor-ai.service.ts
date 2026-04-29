import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface CaptionSuggestion {
  id: string;
  text: string;
}

@Injectable({ providedIn: 'root' })
export class EditorAiService {
  /**
   * Mock AI suggestions. Wire this to a real endpoint when available.
   * Returns 3 caption suggestions based on the prompt.
   */
  suggestCaptions(prompt: string): Observable<CaptionSuggestion[]> {
    const trimmed = prompt.trim() || 'this post';
    const samples: CaptionSuggestion[] = [
      {
        id: 'a',
        text: `🚀 ${this.titleCase(trimmed)} — proud to share what we're building. Tap in. #culture #greatplacetowork`
      },
      {
        id: 'b',
        text: `Behind every milestone, there's a team. Today we celebrate ours. ✨ #${this.slug(trimmed)} #people`
      },
      {
        id: 'c',
        text: `${this.titleCase(trimmed)} doesn't happen by accident — it's the result of trust, candor, and craft. Read more in comments.`
      }
    ];
    return of(samples).pipe(delay(450));
  }

  reply(prompt: string): Observable<string> {
    const text = `Sure — here's a refined take on "${prompt}":\n\n` +
      `1. Lead with a sharp hook in the first 7 words.\n` +
      `2. Add a specific data point or quote.\n` +
      `3. End with a low-friction CTA. Want me to apply this to your headline?`;
    return of(text).pipe(delay(350));
  }

  private titleCase(input: string): string {
    return input
      .split(' ')
      .map((s) => (s.length === 0 ? s : s[0].toUpperCase() + s.slice(1)))
      .join(' ');
  }

  private slug(input: string): string {
    return input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '')
      .slice(0, 18) || 'team';
  }
}
