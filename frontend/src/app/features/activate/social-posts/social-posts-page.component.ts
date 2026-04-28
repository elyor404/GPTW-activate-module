import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface SocialPost {
  id: number;
  image: string;
  category: string;
  status: 'draft' | 'pending' | 'approved' | 'published';
  backgroundColor?: string;
  aspectRatio?: string;
}

@Component({
  selector: 'app-social-posts-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './social-posts-page.component.html',
  styleUrl: './social-posts-page.component.scss'
})
export class SocialPostsPageComponent {
  constructor(private router: Router) {}
  
  posts: SocialPost[] = [
    { id: 1, image: '/posts/post1.svg', category: 'Best Workplace', status: 'draft', backgroundColor: '#E8472A', aspectRatio: '1 / 1' },
    { id: 2, image: '/posts/Facebook post - 1.svg', category: 'Best for Women', status: 'draft', backgroundColor: '#1A3C4D', aspectRatio: '4 / 5' },
    { id: 3, image: '/posts/Facebook post - 2.svg', category: 'Best for Women', status: 'pending', backgroundColor: '#E8472A', aspectRatio: '4 / 5' },
    { id: 4, image: '/posts/Instagram story - 1.svg', category: 'Best Workplace', status: 'approved', backgroundColor: '#1A3C4D', aspectRatio: '1 / 1' },
    { id: 5, image: '/posts/Instagram story - 2.svg', category: 'Best for Women', status: 'published', backgroundColor: '#1E2A35', aspectRatio: '9 / 16' },
  ];

  get draftPosts(): SocialPost[] {
    return this.posts.filter(p => p.status === 'draft');
  }

  get pendingPosts(): SocialPost[] {
    return this.posts.filter(p => p.status === 'pending');
  }

  get approvedPosts(): SocialPost[] {
    return this.posts.filter(p => p.status === 'approved');
  }

  get publishedPosts(): SocialPost[] {
    return this.posts.filter(p => p.status === 'published');
  }

  createNewPost(): void {
    this.router.navigate(['/activate/social-posts/create-post']);
  }
}
