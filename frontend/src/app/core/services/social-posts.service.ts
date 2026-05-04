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
  canvasState?: any;
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
}

const SEED_SPECS: SeedSpec[] = [
  // Draft
  { status: 'draft', previewImage: '/posts/post1.svg', description: 'Excited to be recognized as a Best Workplace 2026!', size: 'square', colour: '#E8472A' },
  { status: 'draft', previewImage: '/posts/Facebook post - 1.svg', description: 'Top 5% Trust Index globally — thank you to our team.', size: 'landscape', colour: '#FF6A47' },
  { status: 'draft', previewImage: '/posts/Instagram story - 1.svg', description: 'Celebrating our certified culture.', size: 'story', colour: '#FF6A47' },
  { status: 'draft', previewImage: '/posts/Facebook post - 2.svg', description: 'Our people make us a Best Workplace.', size: 'landscape', colour: '#004051' },

  // Pending Approval
  { status: 'pending', previewImage: '/posts/Facebook post - 2.svg', description: 'Best for Women 2026 — celebrating our team.', size: 'landscape', colour: '#004051' },
  { status: 'pending', previewImage: '/posts/1.svg', description: 'Why our employees love coming to work.', size: 'square', colour: '#E8472A' },

  // Approved
  { status: 'approved', previewImage: '/posts/Instagram story - 1.svg', description: 'Best Workplace Asia 2026 — thank you!', size: 'story', colour: '#FF6A47' },
  { status: 'approved', previewImage: '/posts/Facebook post - 1.svg', description: '98% of our employees are proud to work here.', size: 'landscape', colour: '#FF6A47' },
  { status: 'approved', previewImage: '/posts/Facebook post - 2.svg', description: 'Best for Diversity 2026.', size: 'landscape', colour: '#004051' },

  // Published
  { status: 'published', previewImage: '/posts/Instagram story - 2.svg', description: 'Best Workplace 2026 — share the news!', size: 'story', colour: '#FF6A47' },
  { status: 'published', previewImage: '/posts/Facebook post - 2.svg', description: 'Thank you to every teammate who made this possible.', size: 'landscape', colour: '#004051' }
];

function buildSeedCanvasState(spec: SeedSpec): any {
  let width = 1080;
  let height = 1080;
  if (spec.size === 'story') {
    width = 1080;
    height = 1920;
  } else if (spec.size === 'landscape') {
    width = 1600;
    height = 900;
  }

  return {
    version: 1,
    canvasSize: { width, height },
    background: spec.colour,
    backgroundImage: null,
    showGrid: false,
    showRulers: false,
    caption: spec.description,
    elements: [
      {
        id: `seed-image-${spec.previewImage}`,
        type: 'image',
        name: 'Post image',
        url: spec.previewImage,
        x: 0,
        y: 0,
        width,
        height,
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
        zIndex: 0,
        filter: 'none',
        borderRadius: 0,
        shadow: false,
        shadowBlur: 0,
        shadowOffsetX: 0,
        shadowOffsetY: 0
      }
    ]
  };
}

function buildSeedPost(spec: SeedSpec, id: number): Post {
  return {
    id,
    status: spec.status,
    previewImage: spec.previewImage,
    description: spec.description,
    postType: 'image',
    size: spec.size,
    templateId: null,
    colour: spec.colour,
    badgeId: '1',
    logoId: null,
    uploadedFiles: [],
    canvasState: buildSeedCanvasState(spec)
  };
}

const STORAGE_KEY = 'gptw.social_posts_v3';

@Injectable({ providedIn: 'root' })
export class SocialPostsService {
  private readonly _posts = signal<Post[]>(this.loadFromStorage());

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

  private loadFromStorage(): Post[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Failed to load posts from storage', e);
    }
    // Fallback to seeds if empty
    return SEED_SPECS.map((spec, idx) => buildSeedPost(spec, idx + 1));
  }

  private saveToStorage(posts: Post[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    } catch (e) {
      console.warn('Failed to save posts to storage', e);
    }
  }

  addPost(post: Omit<Post, 'id'>): void {
    const nextId = Math.max(0, ...this._posts().map((p) => p.id)) + 1;
    this._posts.update((posts) => {
      const updated = [{ id: nextId, ...post }, ...posts];
      this.saveToStorage(updated);
      return updated;
    });
  }

  updatePost(id: number, patch: Partial<Post>): void {
    this._posts.update((posts) => {
      const updated = posts.map((p) => (p.id === id ? { ...p, ...patch } : p));
      this.saveToStorage(updated);
      return updated;
    });
  }

  updatePostStatus(id: number, status: PostStatus): void {
    this.updatePost(id, { status });
  }

  /**
   * Removes the post from memory only — intentionally not persisted to localStorage,
   * so a refresh restores the post (prototype behaviour).
   */
  deletePost(id: number): void {
    this._posts.update((posts) => posts.filter((p) => p.id !== id));
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

    this._posts.update((posts) => {
      const updated = [draft, ...posts];
      this.saveToStorage(updated);
      return updated;
    });
    this._recommendations.update((recs) => recs.filter((r) => r.id !== recommendationId));
  }
}
