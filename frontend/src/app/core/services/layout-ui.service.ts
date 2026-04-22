import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LayoutUiService {
  readonly activateAiPlusEnabled = signal(true);
  readonly mobileSidebarOpen = signal(false);

  toggleActivateAiPlus(): void {
    this.activateAiPlusEnabled.update((v) => !v);
  }

  toggleMobileSidebar(): void {
    this.mobileSidebarOpen.update((v) => !v);
  }

  closeMobileSidebar(): void {
    this.mobileSidebarOpen.set(false);
  }
}
