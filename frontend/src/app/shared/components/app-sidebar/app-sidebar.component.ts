import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LayoutUiService } from '../../../core/services/layout-ui.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './app-sidebar.component.html',
  styleUrl: './app-sidebar.component.scss'
})
export class AppSidebarComponent {
  private readonly router = inject(Router);
  protected readonly layoutUi = inject(LayoutUiService);

  /** Manual chevron toggle; URL under /activate keeps it open via subscription. */
  protected readonly activateMenuOpen = signal(this.router.url.startsWith('/activate'));

  constructor() {
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed()
      )
      .subscribe(() => {
        if (this.router.url.startsWith('/activate')) {
          this.activateMenuOpen.set(true);
        }
        this.layoutUi.closeMobileSidebar();
      });
  }

  protected toggleActivateMenu(): void {
    this.activateMenuOpen.update((v) => !v);
  }
}
