import { Injectable, computed, signal } from '@angular/core';

export type PostStatus = 'draft' | 'pending' | 'approved' | 'published';
export type PostType = 'text' | 'image' | 'video';
export type PostSize = 'square' | 'story' | 'landscape';

export interface UploadedFile {
  id: string;
  url: string;
  type: 'image' | 'video';
}

export interface Post {
  id: number;
  status: PostStatus;
  previewImage: string;
  description: string;
  postType: PostType | null;
  size: PostSize | null;
  templateId: string | null;
  colour: string | null;
  badgeId: string | null;
  logoId: string | null;
  uploadedFiles: UploadedFile[];
}

export interface RecommendedPost {
  id: number;
  image: string;
  backgroundColor: string;
  title: string;
  category: string;
  aspectRatio?: string;
}

interface SeedSpec {
  status: PostStatus;
  previewImage: string;
  description: string;
  size: PostSize;
  colour: string;
  templateId: string;
}

const SEED_SPECS: SeedSpec[] = [
  // Draft (5)
  { status: 'draft', previewImage: '/posts/post1.svg', description: 'Excited to be recognized as a Best Workplace 2026!', size: 'square', colour: '#E8472A', templateId: '1' },
  { status: 'draft', previewImage: '/posts/Facebook post - 1.svg', description: 'Top 5% Trust Index globally — thank you to our team.', size: 'square', colour: '#1A3C4D', templateId: '2' },
  { status: 'draft', previewImage: '/posts/Instagram story - 1.svg', description: 'Celebrating our certified culture.', size: 'story', colour: '#1E2A35', templateId: '3' },
  { status: 'draft', previewImage: '/posts/Facebook post - 2.svg', description: 'Our people make us a Best Workplace.', size: 'square', colour: '#0F3D45', templateId: '1' },

  // Pending Approval (5)
  { status: 'pending', previewImage: '/posts/Facebook post - 2.svg', description: 'Best for Women 2026 — celebrating our team.', size: 'square', colour: '#E8472A', templateId: '3' },
  { status: 'pending', previewImage: '/posts/1.svg', description: 'Why our employees love coming to work.', size: 'landscape', colour: '#0F3D45', templateId: '2' },

  // Approved (5)
  { status: 'approved', previewImage: '/posts/Instagram story - 1.svg', description: 'Best Workplace Asia 2026 — thank you!', size: 'story', colour: '#1A3C4D', templateId: '3' },
  { status: 'approved', previewImage: '/posts/Facebook post - 1.svg', description: '98% of our employees are proud to work here.', size: 'square', colour: '#E8472A', templateId: '4' },
  { status: 'approved', previewImage: '/posts/Facebook post - 2.svg', description: 'Best for Diversity 2026.', size: 'square', colour: '#0F3D45', templateId: '3' },

  // Published (5)
  { status: 'published', previewImage: '/posts/Instagram story - 2.svg', description: 'Best Workplace 2026 — share the news!', size: 'story', colour: '#1E2A35', templateId: '1' },
  { status: 'published', previewImage: '/posts/Facebook post - 2.svg', description: 'Thank you to every teammate who made this possible.', size: 'square', colour: '#0F3D45', templateId: '1' }
];

function buildSeedPost(spec: SeedSpec, id: number): Post {
  return {
    id,
    status: spec.status,
    previewImage: spec.previewImage,
    description: spec.description,
    postType: 'image',
    size: spec.size,
    templateId: spec.templateId,
    colour: spec.colour,
    badgeId: '1',
    logoId: null,
    uploadedFiles: []
  };
}

@Injectable({ providedIn: 'root' })
export class SocialPostsService {
  private readonly _posts = signal<Post[]>(
    SEED_SPECS.map((spec, idx) => buildSeedPost(spec, idx + 1))
  );

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

  addPost(post: Omit<Post, 'id'>): void {
    const nextId = Math.max(0, ...this._posts().map((p) => p.id)) + 1;
    this._posts.update((posts) => [{ id: nextId, ...post }, ...posts]);
  }

  updatePostStatus(id: number, status: PostStatus): void {
    this._posts.update((posts) =>
      posts.map((p) => (p.id === id ? { ...p, status } : p))
    );
  }

  getPostById(id: number): Post | undefined {
    return this._posts().find((p) => p.id === id);
  }

  moveRecommendationToDraft(recommendationId: number): void {
    const rec = this._recommendations().find((r) => r.id === recommendationId);
    if (!rec) return;

    const nextId = Math.max(0, ...this._posts().map((p) => p.id)) + 1;
    const draft: Post = {
      id: nextId,
      status: 'draft',
      previewImage: rec.image,
      description: rec.title,
      postType: 'image',
      size: 'landscape',
      templateId: '1',
      colour: rec.backgroundColor,
      badgeId: '1',
      logoId: null,
      uploadedFiles: []
    };

    this._posts.update((posts) => [draft, ...posts]);
    this._recommendations.update((recs) => recs.filter((r) => r.id !== recommendationId));
  }
}
