import { Component, OnInit, OnDestroy, TemplateRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { PostPreviewService, PostPreviewData } from '../../../../core/services/post-preview.service';
import { HeaderContextService } from '../../../../core/services/header-context.service';

@Component({
  selector: 'app-preview-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './preview-page.html',
  styleUrl: './preview-page.scss'
})
export class PreviewPageComponent implements OnInit, OnDestroy, AfterViewInit {
  private destroy$ = new Subject<void>();

  @ViewChild('headerLeft') headerLeft!: TemplateRef<unknown>;
  @ViewChild('headerCenter') headerCenter!: TemplateRef<unknown>;
  @ViewChild('headerRight') headerRight!: TemplateRef<unknown>;

  previewData: PostPreviewData | null = null;
  projectName = 'Project Name';
  zoomLevel = 100;

  constructor(
    private router: Router,
    private postPreviewService: PostPreviewService,
    private headerContextService: HeaderContextService
  ) {}

  ngOnInit(): void {
    this.postPreviewService.getPreviewData()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.previewData = data;
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

  goBack(): void {
    this.router.navigate(['/activate/social-posts/create-post']);
  }

  saveDraft(): void {
    console.log('Save Draft clicked', this.previewData);
  }

  approve(): void {
    console.log('Approve clicked', this.previewData);
  }

  publish(): void {
    console.log('Publish clicked', this.previewData);
    this.postPreviewService.clearData();
    this.router.navigate(['/activate/social-posts']);
  }

  zoomIn(): void {
    if (this.zoomLevel < 200) {
      this.zoomLevel += 10;
    }
  }

  zoomOut(): void {
    if (this.zoomLevel > 50) {
      this.zoomLevel -= 10;
    }
  }

  getPreviewSizeClass(): string {
    if (!this.previewData) return '';
    switch (this.previewData.size) {
      case 'story': return 'preview-canvas--story';
      case 'landscape': return 'preview-canvas--landscape';
      case 'square': return 'preview-canvas--square';
      default: return '';
    }
  }
}
