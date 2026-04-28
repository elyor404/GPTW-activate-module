import { Injectable, TemplateRef, signal } from '@angular/core';

export interface HeaderContext {
  showDefaultHeader: boolean;
  leftContent?: TemplateRef<unknown> | null;
  centerContent?: TemplateRef<unknown> | null;
  rightContent?: TemplateRef<unknown> | null;
}

@Injectable({
  providedIn: 'root'
})
export class HeaderContextService {
  private readonly defaultContext: HeaderContext = {
    showDefaultHeader: true,
    leftContent: null,
    centerContent: null,
    rightContent: null
  };

  readonly context = signal<HeaderContext>(this.defaultContext);

  setContext(context: Partial<HeaderContext>): void {
    this.context.set({
      ...this.defaultContext,
      ...context
    });
  }

  resetContext(): void {
    this.context.set(this.defaultContext);
  }
}
