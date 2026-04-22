import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly ADMIN_EMAIL = 'user-admin@gmail.com';
  private readonly ADMIN_PASSWORD = 'prototype';

  readonly isLoggedIn = signal(this.checkStoredAuth());

  constructor(private router: Router) {}

  private checkStoredAuth(): boolean {
    return sessionStorage.getItem('isLoggedIn') === 'true';
  }

  login(email: string, password: string): boolean {
    if (email === this.ADMIN_EMAIL && password === this.ADMIN_PASSWORD) {
      sessionStorage.setItem('isLoggedIn', 'true');
      this.isLoggedIn.set(true);
      return true;
    }
    return false;
  }

  logout(): void {
    sessionStorage.removeItem('isLoggedIn');
    this.isLoggedIn.set(false);
    this.router.navigate(['/login']);
  }
}
