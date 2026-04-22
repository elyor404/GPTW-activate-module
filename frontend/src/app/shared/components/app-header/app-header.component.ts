import { Component, inject, signal, HostListener } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LayoutUiService } from '../../../core/services/layout-ui.service';
import { AuthService } from '../../../core/services/auth.service';
import { LogoutModalComponent } from '../logout-modal/logout-modal.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, LogoutModalComponent],
  templateUrl: './app-header.component.html',
  styleUrl: './app-header.component.scss'
})
export class AppHeaderComponent {
  protected readonly layoutUi = inject(LayoutUiService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected dropdownOpen = signal(false);
  protected showLogoutModal = signal(false);

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.header__profile-wrapper')) {
      this.dropdownOpen.set(false);
    }
  }

  protected toggleDropdown(): void {
    this.dropdownOpen.update(v => !v);
  }

  protected openEditProfile(): void {
    this.dropdownOpen.set(false);
    this.router.navigate(['/profile/edit']);
  }

  protected openLogoutModal(): void {
    this.dropdownOpen.set(false);
    this.showLogoutModal.set(true);
  }

  protected confirmLogout(): void {
    this.showLogoutModal.set(false);
    this.auth.logout();
  }

  protected cancelLogout(): void {
    this.showLogoutModal.set(false);
  }
}
