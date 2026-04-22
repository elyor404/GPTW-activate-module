import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss'
})
export class LoginPageComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected email = 'user-admin@gmail.com';
  protected password = 'prototype';
  protected showPassword = signal(false);
  protected rememberMe = false;
  protected error = signal('');

  protected togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  protected onSubmit(): void {
    this.error.set('');

    if (this.auth.login(this.email, this.password)) {
      this.router.navigate(['/dashboard']);
    } else {
      this.error.set('Invalid email or password');
    }
  }
}
