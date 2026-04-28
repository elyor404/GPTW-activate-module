import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SocialPostsService } from '../../../core/services/social-posts.service';

@Component({
  selector: 'app-social-posts-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './social-posts-page.component.html',
  styleUrl: './social-posts-page.component.scss'
})
export class SocialPostsPageComponent {
  private readonly router = inject(Router);
  private readonly socialPosts = inject(SocialPostsService);

  readonly draftPosts = this.socialPosts.draftPosts;
  readonly pendingPosts = this.socialPosts.pendingPosts;
  readonly approvedPosts = this.socialPosts.approvedPosts;
  readonly publishedPosts = this.socialPosts.publishedPosts;

  createNewPost(): void {
    this.router.navigate(['/activate/social-posts/create-post']);
  }
}
