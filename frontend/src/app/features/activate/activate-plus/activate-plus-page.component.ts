import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RecommendedPost, SocialPostsService } from '../../../core/services/social-posts.service';

@Component({
  selector: 'app-activate-plus-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activate-plus-page.component.html',
  styleUrl: './activate-plus-page.component.scss'
})
export class ActivatePlusPageComponent {
  private readonly router = inject(Router);
  private readonly socialPosts = inject(SocialPostsService);

  readonly recommendations = this.socialPosts.recommendations;

  moveToDraft(rec: RecommendedPost): void {
    this.socialPosts.moveRecommendationToDraft(rec.id);
    this.router.navigate(['/activate/social-posts']);
  }
}
