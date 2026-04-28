import { Component, OnInit, OnDestroy, TemplateRef, ViewChild, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { PostPreviewService, PostPreviewData } from '../../../../core/services/post-preview.service';
import { HeaderContextService } from '../../../../core/services/header-context.service';

export interface CanvasElement {
  id: string;
  type: 'text' | 'image' | 'shape';
  content?: string;
  url?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
  fontSize?: number;
  shapeType?: 'circle' | 'square';
}

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

  activeTool: 'select' | 'move' | 'text' | 'image' | 'shape' | 'ai' = 'select';
  canvasElements: CanvasElement[] = [];
  selectedElementId: string | null = null;

  isDragging = false;
  isResizing = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private elementStartX = 0;
  private elementStartY = 0;
  private elementStartWidth = 0;
  private elementStartHeight = 0;

  availableColors = ['#2D3748', '#E53E3E', '#38A169', '#3182CE', '#D69E2E', '#805AD5', '#FFFFFF', '#000000'];

  constructor(
    private router: Router,
    private postPreviewService: PostPreviewService,
    private headerContextService: HeaderContextService
  ) {}

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if ((event.key === 'Delete' || event.key === 'Backspace') && this.selectedElementId) {
      // Don't delete if user is editing text
      const target = event.target as HTMLElement;
      if (target.contentEditable === 'true' || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }
      this.deleteSelected();
    }
  }

  ngOnInit(): void {
    this.postPreviewService.getPreviewData()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.previewData = data;
        this.initializeBaseElements(data);
      });
  }

  private initializeBaseElements(data: PostPreviewData): void {
    if (this.canvasElements.length > 0) return;

    let canvasWidth = 400;
    let canvasHeight = 400;

    switch (data.size) {
      case 'story':
        canvasWidth = 300;
        canvasHeight = 533;
        break;
      case 'landscape':
        canvasWidth = 500;
        canvasHeight = 281;
        break;
      case 'square':
        canvasWidth = 400;
        canvasHeight = 400;
        break;
    }

    if (data.badgeUrl) {
      this.canvasElements.push({
        id: 'base-badge',
        type: 'image',
        url: data.badgeUrl,
        x: 15,
        y: 15,
        width: 60,
        height: 60
      });
    }

    if (data.logoUrl) {
      this.canvasElements.push({
        id: 'base-logo',
        type: 'image',
        url: data.logoUrl,
        x: canvasWidth - 95,
        y: canvasHeight - 55,
        width: 80,
        height: 40
      });
    }
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

  setTool(tool: 'select' | 'move' | 'text' | 'image' | 'shape' | 'ai'): void {
    this.activeTool = tool;
    if (tool !== 'select' && tool !== 'move') {
      this.addElement(tool);
    }
  }

  private addElement(type: string): void {
    const id = Date.now().toString();
    let newElement: CanvasElement;

    switch (type) {
      case 'text':
        newElement = {
          id,
          type: 'text',
          content: 'New Text',
          x: 50,
          y: 50,
          width: 150,
          height: 40,
          fontSize: 24,
          color: '#2D3748'
        };
        break;
      case 'image':
        newElement = {
          id,
          type: 'image',
          url: '/posts/placeholder.png',
          x: 100,
          y: 100,
          width: 200,
          height: 200
        };
        break;
      case 'shape':
        newElement = {
          id,
          type: 'shape',
          shapeType: 'square',
          color: '#5BA6A6',
          x: 150,
          y: 150,
          width: 100,
          height: 100
        };
        break;
      case 'ai':
        newElement = {
          id,
          type: 'text',
          content: '✨ AI Generated Content',
          x: 50,
          y: 200,
          width: 250,
          height: 50,
          fontSize: 20,
          color: '#5A757C'
        };
        break;
      default:
        return;
    }

    this.canvasElements.push(newElement);
    this.selectedElementId = id;
    this.activeTool = 'select';
  }

  selectElement(id: string, event: MouseEvent): void {
    event.stopPropagation();
    this.selectedElementId = id;
    
    if (this.activeTool === 'move') {
      this.startDragging(id, event);
    }
  }

  deselectAll(): void {
    this.selectedElementId = null;
  }

  private startDragging(id: string, event: MouseEvent): void {
    const element = this.canvasElements.find(e => e.id === id);
    if (!element) return;

    this.isDragging = true;
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
    this.elementStartX = element.x;
    this.elementStartY = element.y;
  }

  startResizing(id: string, event: MouseEvent): void {
    event.stopPropagation();
    const element = this.canvasElements.find(e => e.id === id);
    if (!element) return;

    this.isResizing = true;
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
    this.elementStartWidth = element.width;
    this.elementStartHeight = element.height;
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.selectedElementId) return;
    const element = this.canvasElements.find(e => e.id === this.selectedElementId);
    if (!element) return;

    const dx = (event.clientX - this.dragStartX) / (this.zoomLevel / 100);
    const dy = (event.clientY - this.dragStartY) / (this.zoomLevel / 100);

    if (this.isDragging) {
      element.x = this.elementStartX + dx;
      element.y = this.elementStartY + dy;
    } else if (this.isResizing) {
      element.width = Math.max(20, this.elementStartWidth + dx);
      element.height = Math.max(20, this.elementStartHeight + dy);
      
      // Also scale font size if it's text
      if (element.type === 'text') {
         element.fontSize = Math.max(8, (element.height / this.elementStartHeight) * (element.fontSize || 24));
      }
    }
  }

  @HostListener('window:mouseup')
  onMouseUp(): void {
    this.isDragging = false;
    this.isResizing = false;
  }

  updateTextColor(color: string): void {
    const element = this.canvasElements.find(e => e.id === this.selectedElementId);
    if (element && element.type === 'text') {
      element.color = color;
    }
  }

  getSelectedElement(): CanvasElement | null {
    return this.canvasElements.find(e => e.id === this.selectedElementId) || null;
  }

  deleteSelected(): void {
    if (this.selectedElementId) {
      this.canvasElements = this.canvasElements.filter(e => e.id !== this.selectedElementId);
      this.selectedElementId = null;
    }
  }

  goBack(): void {
    this.router.navigate(['/activate/social-posts/create-post']);
  }

  saveDraft(): void {
    console.log('Save Draft clicked', { data: this.previewData, elements: this.canvasElements });
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
