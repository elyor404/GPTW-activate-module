import { Injectable, computed, signal } from '@angular/core';

export type SocialPostStatus = 'draft' | 'pending' | 'approved' | 'published';

export interface SocialPost {
  id: number;
  image: string;
  category: string;
  status: SocialPostStatus;
  backgroundColor?: string;
  aspectRatio?: string;
}

export interface RecommendedPost {
  id: number;
  image: string;
  backgroundColor: string;
  title: string;
  category: string;
  aspectRatio?: string;
}

@Injectable({ providedIn: 'root' })
export class SocialPostsService {
  private readonly _posts = signal<SocialPost[]>([
    { id: 1, image: '/posts/post1.svg', category: 'Best Workplace', status: 'draft', backgroundColor: '#E8472A', aspectRatio: '1 / 1' },
    { id: 2, image: '/posts/Facebook post - 1.svg', category: 'Best for Women', status: 'draft', backgroundColor: '#1A3C4D', aspectRatio: '4 / 5' },
    { id: 3, image: '/posts/Facebook post - 2.svg', category: 'Best for Women', status: 'pending', backgroundColor: '#E8472A', aspectRatio: '4 / 5' },
    { id: 4, image: '/posts/Instagram story - 1.svg', category: 'Best Workplace', status: 'approved', backgroundColor: '#1A3C4D', aspectRatio: '1 / 1' },
    { id: 5, image: '/posts/Instagram story - 2.svg', category: 'Best for Women', status: 'published', backgroundColor: '#1E2A35', aspectRatio: '9 / 16' }
  ]);

  private readonly _recommendations = signal<RecommendedPost[]>([
    {
      id: 101,
      image: '/posts/Facebook post - 1.svg',
      backgroundColor: '#FF6A47',
      title: 'We are excited to share that we are in the top 5% Trust Index globally',
      category: 'Top 5% Trust Index',
      aspectRatio: '1200 / 630'
    },
    {
      id: 102,
      image: '/posts/Facebook post - 2.svg',
      backgroundColor: '#0F3D45',
      title: 'We are excited to share that we are in the top 5% Trust Index globally',
      category: 'Top 5% Trust Index',
      aspectRatio: '1200 / 630'
    },
    {
      id: 103,
      image: '/posts/Instagram story - 1.svg',
      backgroundColor: '#1A2E5C',
      title: 'We are excited to share that we are in the top 5% Trust Index globally',
      category: 'Top 5% Trust Index',
      aspectRatio: '1200 / 630'
    }
  ]);

  readonly posts = this._posts.asReadonly();
  readonly recommendations = this._recommendations.asReadonly();

  readonly draftPosts = computed(() => this._posts().filter((p) => p.status === 'draft'));
  readonly pendingPosts = computed(() => this._posts().filter((p) => p.status === 'pending'));
  readonly approvedPosts = computed(() => this._posts().filter((p) => p.status === 'approved'));
  readonly publishedPosts = computed(() => this._posts().filter((p) => p.status === 'published'));

  moveRecommendationToDraft(recommendationId: number): void {
    const rec = this._recommendations().find((r) => r.id === recommendationId);
    if (!rec) return;

    const nextId = Math.max(0, ...this._posts().map((p) => p.id)) + 1;
    const draft: SocialPost = {
      id: nextId,
      image: rec.image,
      category: rec.category,
      status: 'draft',
      backgroundColor: rec.backgroundColor,
      aspectRatio: rec.aspectRatio
    };

    this._posts.update((posts) => [draft, ...posts]);
    this._recommendations.update((recs) => recs.filter((r) => r.id !== recommendationId));
  }
}
