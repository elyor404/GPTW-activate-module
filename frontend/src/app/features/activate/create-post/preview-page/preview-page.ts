import {
  AfterViewInit,
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
  computed,
  effect,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { PostPreviewService, PostPreviewData } from '../../../../core/services/post-preview.service';
import { HeaderContextService } from '../../../../core/services/header-context.service';
import { LayoutUiService } from '../../../../core/services/layout-ui.service';
import { SocialPostsService, PostStatus, PostType, PostSize } from '../../../../core/services/social-posts.service';
import { EditorStore } from './editor/editor-store.service';
import { ToolName, ShapeType, CanvasState } from './editor/editor-types';
import { EditorCanvasComponent } from './editor/components/editor-canvas/editor-canvas.component';
import { PropertiesPanelComponent } from './editor/components/properties-panel/properties-panel.component';
import { LayersPanelComponent } from './editor/components/layers-panel/layers-panel.component';
import { CaptionEditorComponent } from './editor/components/caption-editor/caption-editor.component';
import { AiAssistantComponent } from './editor/components/ai-assistant/ai-assistant.component';
import {
  ApproveModalComponent
} from './editor/components/approve-modal/approve-modal.component';
import {
  PublishModalComponent,
  PublishPayload
} from './editor/components/publish-modal/publish-modal.component';

const STORAGE_KEY = 'gptw.editor.draft';

@Component({
  selector: 'app-preview-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EditorCanvasComponent,
    PropertiesPanelComponent,
    LayersPanelComponent,
    CaptionEditorComponent,
    AiAssistantComponent,
    ApproveModalComponent,
    PublishModalComponent
  ],
  templateUrl: './preview-page.html',
  styleUrl: './preview-page.scss',
  encapsulation: ViewEncapsulation.None
})
export class PreviewPageComponent implements OnInit, OnDestroy, AfterViewInit {
  private destroy$ = new Subject<void>();

  @ViewChild('headerLeft', { static: true }) headerLeft!: TemplateRef<unknown>;
  @ViewChild('headerCenter', { static: true }) headerCenter!: TemplateRef<unknown>;
  @ViewChild('headerRight', { static: true }) headerRight!: TemplateRef<unknown>;
  @ViewChild(CaptionEditorComponent) caption?: CaptionEditorComponent;
  @ViewChild(EditorCanvasComponent) canvas?: EditorCanvasComponent;

  protected readonly store = inject(EditorStore);
  protected readonly layoutUi = inject(LayoutUiService);
  private readonly router = inject(Router);
  private readonly postPreviewService = inject(PostPreviewService);
  private readonly headerContextService = inject(HeaderContextService);
  private readonly socialPostsService = inject(SocialPostsService);

  protected readonly previewData = signal<PostPreviewData | null>(null);
  protected readonly projectName = 'Project Name';
  protected readonly shapeMenuOpen = signal(false);
  protected readonly approveOpen = signal(false);
  protected readonly publishOpen = signal(false);
  protected readonly toastMessage = signal<string | null>(null);
  protected readonly mobileBlocked = signal(false);

  protected readonly aiAssistantVisible = computed(() => this.store.showAiAssistant());

  private initialised = false;

  constructor() {
    effect(() => {
      const tool = this.store.activeTool();
      if (tool !== 'shape') this.shapeMenuOpen.set(false);
    });

    effect(() => {
      const aiPlus = this.layoutUi.activateAiPlusEnabled();
      this.store.toggleAiAssistant(aiPlus);
    });
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;
    const inEditable = !!target && (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    );

    const meta = event.ctrlKey || event.metaKey;

    if (meta && event.key.toLowerCase() === 'z') {
      event.preventDefault();
      if (event.shiftKey) this.store.redo();
      else this.store.undo();
      return;
    }
    if (meta && (event.key === 'y' || event.key === 'Y')) {
      event.preventDefault();
      this.store.redo();
      return;
    }
    if (meta && event.key.toLowerCase() === 'd') {
      if (inEditable) return;
      event.preventDefault();
      this.store.duplicateSelected();
      return;
    }
    if (meta && event.key.toLowerCase() === 'a') {
      if (inEditable) return;
      event.preventDefault();
      this.store.selectAll();
      return;
    }
    if ((event.key === 'Delete' || event.key === 'Backspace') && !inEditable) {
      if (this.store.selectedIds().length === 0) return;
      event.preventDefault();
      this.store.deleteSelected();
      return;
    }
    if (event.key === 'Escape') {
      this.store.clearSelection();
      this.shapeMenuOpen.set(false);
      this.approveOpen.set(false);
      this.publishOpen.set(false);
      return;
    }
    if (
      !inEditable &&
      ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key) &&
      this.store.selectedIds().length > 0
    ) {
      event.preventDefault();
      const step = event.shiftKey ? 10 : 1;
      const dx = event.key === 'ArrowLeft' ? -step : event.key === 'ArrowRight' ? step : 0;
      const dy = event.key === 'ArrowUp' ? -step : event.key === 'ArrowDown' ? step : 0;
      this.store.nudgeSelected(dx, dy);
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateMobileGate();
  }

  ngOnInit(): void {
    this.updateMobileGate();
    // Always clear any stale draft so it can never bleed into a fresh preview session.
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }

    this.postPreviewService
      .getPreviewData()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.previewData.set(data);
        if (!this.initialised) {
          this.initialised = true;
          // Always build the canvas from the current form selections.
          // We never restore from localStorage here — that global key is
          // unrelated to whichever post (new or edited) is being previewed.
          this.bootstrapFromPreview(data);
        }
      });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.headerContextService.setContext({
        showDefaultHeader: false,
        leftContent: this.headerLeft,
        centerContent: this.headerCenter,
        rightContent: this.headerRight
      });
    });
  }

  ngOnDestroy(): void {
    this.headerContextService.resetContext();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateMobileGate(): void {
    this.mobileBlocked.set(window.innerWidth < 768);
  }

  /**
   * Kept for reference but no longer called on init.
   * Could be wired to an explicit "Restore last draft" action in future.
   */

  private tryLoadDraft(): boolean {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw) as CanvasState;
      if (parsed && parsed.elements && parsed.canvasSize) {
        this.store.loadState(parsed);
        return true;
      }
    } catch {
      /* ignore */
    }
    return false;
  }

  private bootstrapFromPreview(data: PostPreviewData | null): void {
    if (!data) return;
    this.store.resetToDefaults();
    let width = 1080;
    let height = 1080;
    if (data.size === 'story') {
      width = 1080;
      height = 1920;
    } else if (data.size === 'landscape') {
      width = 1600;
      height = 900;
    }
    this.store.setCanvasSize(width, height);
    if (data.colour) this.store.setBackground(data.colour);

    if (data.templateUrl) {
      this.store.addImage(data.templateUrl, {
        x: 0,
        y: 0,
        width,
        height,
        name: 'Template'
      });
    }

    if (data.uploadedFiles?.length && data.postType === 'image') {
      const file = data.uploadedFiles[0];
      const w = width * 0.7;
      const h = height * 0.5;
      this.store.addImage(file.url, {
        name: 'Uploaded photo',
        x: (width - w) / 2,
        y: (height - h) / 2,
        width: w,
        height: h
      });
    }

    if (data.badgeUrl) {
      this.store.addImage(data.badgeUrl, {
        name: 'Badge',
        x: width * 0.04,
        y: height * 0.04,
        width: width * 0.18,
        height: width * 0.18
      });
    }

    if (data.logoUrl) {
      this.store.addImage(data.logoUrl, {
        name: 'Logo',
        x: width * 0.7,
        y: height - height * 0.14,
        width: width * 0.25,
        height: width * 0.1
      });
    }

    this.store.addText({
      content: 'Headline goes here',
      x: width * 0.08,
      y: height * 0.7,
      width: width * 0.7,
      height: 80,
      fontSize: Math.round(width * 0.05),
      color: data.colour && this.isDark(data.colour) ? '#FFFFFF' : '#1a1d1f',
      name: 'Headline'
    });

    if (data.description) {
      this.store.setCaption(data.description);
      this.store.commitCaption();
    }

    this.store.clearSelection();
  }

  private isDark(hex: string): boolean {
    const c = hex.replace('#', '');
    if (c.length !== 6) return false;
    const r = parseInt(c.slice(0, 2), 16);
    const g = parseInt(c.slice(2, 4), 16);
    const b = parseInt(c.slice(4, 6), 16);
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    return lum < 128;
  }

  protected setTool(tool: ToolName, event?: MouseEvent): void {
    event?.stopPropagation();
    if (tool === 'shape') {
      this.store.setActiveTool('shape');
      this.shapeMenuOpen.update((v) => !v);
      return;
    }
    if (tool === 'ai') {
      this.store.setActiveTool('ai');
      this.store.toggleAiAssistant(true);
      return;
    }
    this.shapeMenuOpen.set(false);
    this.store.setActiveTool(tool);
  }

  protected pickShape(shape: ShapeType): void {
    this.store.addShape(shape);
    this.store.setActiveTool('select');
    this.shapeMenuOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.shape-menu') && !target.closest('[data-tool="shape"]')) {
      this.shapeMenuOpen.set(false);
    }
  }

  protected zoomIn(): void {
    this.store.zoomIn();
  }
  protected zoomOut(): void {
    this.store.zoomOut();
  }
  protected resetZoom(): void {
    this.store.resetZoom();
  }

  protected onApplyCaptionFromAi(text: string): void {
    this.caption?.setText(text);
  }

  protected onCloseAi(): void {
    this.store.toggleAiAssistant(false);
  }

  protected goBack(): void {
    this.router.navigate(['/activate/social-posts/create-post']);
  }

  protected async saveDraft(): Promise<void> {
    try {
      const state = this.store.serialize();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
    await this.addPostToDashboard('draft');
    this.flash('Draft saved!');
    setTimeout(() => {
      this.postPreviewService.clearData();
      this.router.navigate(['/activate/social-posts']);
    }, 900);
  }

  protected openApprove(): void {
    this.approveOpen.set(true);
  }

  protected async onApproveConfirmed(): Promise<void> {
    this.approveOpen.set(false);
    await this.addPostToDashboard('pending');
    this.flash('Post sent for approval!');
    setTimeout(() => {
      this.postPreviewService.clearData();
      this.router.navigate(['/activate/social-posts']);
    }, 900);
  }

  protected openPublish(): void {
    this.publishOpen.set(true);
  }

  protected async onPublishConfirmed(payload: PublishPayload): Promise<void> {
    this.publishOpen.set(false);
    await this.addPostToDashboard('published');
    const where = payload.platforms.join(', ');
    const when = payload.publishNow ? 'now' : `at ${payload.scheduledAt}`;
    this.flash(`Published to ${where} ${when}!`);
    setTimeout(() => {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
      this.postPreviewService.clearData();
      this.router.navigate(['/activate/social-posts']);
    }, 900);
  }

  private async addPostToDashboard(status: PostStatus): Promise<void> {
    const data = this.postPreviewService.getCurrentData();
    const capturedImage = await this.canvas?.captureImage();
    
    this.socialPostsService.addPost({
      status,
      previewImage: capturedImage || data.templateUrl || '/posts/post1.svg',
      description: data.description || 'Untitled post',
      postType: (data.postType as PostType | null) ?? 'image',
      size: (data.size as PostSize | null) ?? 'square',
      templateId: null,
      colour: data.colour,
      badgeId: data.badgeUrl ? '1' : null,
      logoId: data.logoUrl ? '1' : null,
      uploadedFiles: data.uploadedFiles ?? []
    });
  }

  private flash(message: string): void {
    this.toastMessage.set(message);
    setTimeout(() => this.toastMessage.set(null), 2200);
  }
}
