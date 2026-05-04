import { Component, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Post, SocialPostsService } from '../../../core/services/social-posts.service';
import { PostPreviewService } from '../../../core/services/post-preview.service';

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
  private readonly postPreviewService = inject(PostPreviewService);

  readonly draftPosts = this.socialPosts.draftPosts;
  readonly pendingPosts = this.socialPosts.pendingPosts;
  readonly approvedPosts = this.socialPosts.approvedPosts;
  readonly publishedPosts = this.socialPosts.publishedPosts;

  readonly openMenuId = signal<number | null>(null);
  readonly previewPost = signal<Post | null>(null);

  createNewPost(): void {
    this.postPreviewService.clearData();
    this.postPreviewService.setEditMode(false);
    this.router.navigate(['/activate/social-posts/create-post']);
  }

  toggleMenu(postId: number, event: Event): void {
    event.stopPropagation();
    this.openMenuId.update((current) => (current === postId ? null : postId));
  }

  @HostListener('document:click')
  closeMenuOnOutsideClick(): void {
    this.openMenuId.set(null);
  }

  @HostListener('document:keydown.escape')
  closePreviewOnEscape(): void {
    this.previewPost.set(null);
  }

  edit(post: Post): void {
    this.openMenuId.set(null);
    this.postPreviewService.clearData();
    this.postPreviewService.setEditMode(true);
    this.postPreviewService.setPostId(post.id);
    this.postPreviewService.setFormState({
      postDescription: post.description,
      selectedPostType: post.postType,
      selectedSize: post.size,
      selectedTemplate: post.templateId,
      selectedColour: post.colour,
      selectedBadge: post.badgeId,
      selectedLogo: post.logoId,
      uploadedFiles: post.uploadedFiles,
      canvasState: post.canvasState
    });
    this.router.navigate(['/activate/social-posts/create-post']);
  }

  approve(post: Post): void {
    this.openMenuId.set(null);
    this.socialPosts.updatePostStatus(post.id, 'approved');
  }

  preview(post: Post): void {
    this.openMenuId.set(null);
    this.previewPost.set(post);
  }

  closePreview(): void {
    this.previewPost.set(null);
  }

  download(post: Post): void {
    this.openMenuId.set(null);
    const link = document.createElement('a');
    link.href = post.previewImage;
    const filename = post.previewImage.split('/').pop() ?? `post-${post.id}.svg`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  postToLinkedIn(post: Post): void {
    this.openMenuId.set(null);
    console.log('Post to LinkedIn (placeholder):', post);
  }

  publish(post: Post): void {
    this.openMenuId.set(null);
    this.socialPosts.updatePostStatus(post.id, 'published');
  }
}
