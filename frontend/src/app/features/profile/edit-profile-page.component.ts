import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { LogoutModalComponent } from '../../shared/components/logout-modal/logout-modal.component';

@Component({
  selector: 'app-edit-profile-page',
  standalone: true,
  imports: [FormsModule, LogoutModalComponent],
  templateUrl: './edit-profile-page.component.html',
  styleUrl: './edit-profile-page.component.scss'
})
export class EditProfilePageComponent {
  private readonly auth = inject(AuthService);

  protected fullName = 'Melisa Roberts';
  protected email = 'melisa.roberts@example.com';
  protected password = '';
  protected confirmPassword = '';

  protected showPassword = signal(false);
  protected showConfirmPassword = signal(false);
  protected showLogoutModal = signal(false);

  protected togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  protected toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update(v => !v);
  }

  protected onSaveChanges(): void {
    // Prototype only - no actual save functionality
  }

  protected onChangePassword(): void {
    // Prototype only - no actual password change functionality
  }

  protected openLogoutModal(): void {
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
