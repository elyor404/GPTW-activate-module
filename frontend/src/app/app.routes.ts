import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login-page.component').then((m) => m.LoginPageComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard-page.component').then((m) => m.DashboardPageComponent)
      },
      {
        path: 'companies',
        data: { title: 'Companies' },
        loadComponent: () =>
          import('./features/placeholder/placeholder-page.component').then((m) => m.PlaceholderPageComponent)
      },
      {
        path: 'team-members',
        data: { title: 'Team Members' },
        loadComponent: () =>
          import('./features/team-members/team-members-page.component').then((m) => m.TeamMembersPageComponent)
      },
      {
        path: 'insights',
        data: { title: 'Insights' },
        loadComponent: () =>
          import('./features/placeholder/placeholder-page.component').then((m) => m.PlaceholderPageComponent)
      },
      {
        path: 'activate',
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
          {
            path: 'dashboard',
            data: { title: 'Activate · Dashboard' },
            loadComponent: () =>
              import('./features/placeholder/placeholder-page.component').then((m) => m.PlaceholderPageComponent)
          },
          {
            path: 'activate-plus',
            data: { title: 'Activate+' },
            loadComponent: () =>
              import('./features/placeholder/placeholder-page.component').then((m) => m.PlaceholderPageComponent)
          },
          {
            path: 'create-post',
            data: { title: 'Create Post' },
            loadComponent: () =>
              import('./features/placeholder/placeholder-page.component').then((m) => m.PlaceholderPageComponent)
          }
        ]
      },
      {
        path: 'elevate',
        data: { title: 'Elevate' },
        loadComponent: () =>
          import('./features/placeholder/placeholder-page.component').then((m) => m.PlaceholderPageComponent)
      },
      {
        path: 'empower',
        data: { title: 'Empower' },
        loadComponent: () =>
          import('./features/placeholder/placeholder-page.component').then((m) => m.PlaceholderPageComponent)
      },
      {
        path: 'profile/edit',
        loadComponent: () =>
          import('./features/profile/edit-profile-page.component').then((m) => m.EditProfilePageComponent)
      }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
