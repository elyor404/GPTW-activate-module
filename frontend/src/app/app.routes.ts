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
          { path: '', pathMatch: 'full', redirectTo: 'social-posts' },
          {
            path: 'social-posts',
            data: { title: 'Activate · Social Posts' },
            loadComponent: () =>
              import('./features/activate/social-posts/social-posts-page.component').then((m) => m.SocialPostsPageComponent)
          },
          {
            path: 'social-posts/create-post',
            data: { title: 'Create Post' },
            loadComponent: () =>
              import('./features/activate/create-post/create-post-page/create-post-page').then((m) => m.CreatePostPageComponent)
          },
          {
            path: 'activate-plus',
            data: { title: 'Activate+' },
            loadComponent: () =>
              import('./features/placeholder/placeholder-page.component').then((m) => m.PlaceholderPageComponent)
          },
          {
            path: 'brand-centre',
            data: { title: 'Brand Centre' },
            loadComponent: () =>
              import('./features/activate/brand-centre/brand-centre-page.component').then((m) => m.BrandCentrePageComponent)
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
