import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { BrandCentreService, Logo } from '../../../../core/services/brand-centre.service';

interface Template {
  id: string;
  imageUrl: string;
}

@Component({
  selector: 'app-create-post-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './create-post-page.html',
  styleUrl: './create-post-page.scss'
})
export class CreatePostPageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  postDescription = '';
  
  selectedPostType = 'text';
  selectedSize = 'story';
  selectedTemplate: string | null = null;
  selectedColour: string | null = null;
  selectedBadge: string | null = null;
  selectedLogo: string | null = null;

  templates: Template[] = [
    { id: '1', imageUrl: '/posts/template-1.png' },
    { id: '2', imageUrl: '/posts/template-2.png' },
    { id: '3', imageUrl: '/posts/template-3.png' },
    { id: '4', imageUrl: '/posts/template-4.png' }
  ];

  colours: string[] = [];
  logos: Logo[] = [];

  uploadedFiles: { id: string; url: string; type: 'image' | 'video' }[] = [];

  constructor(
    private router: Router,
    private brandCentreService: BrandCentreService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.brandCentreService.getBrandCentre()
      .pipe(takeUntil(this.destroy$))
      .subscribe(brandCentre => {
        this.colours = brandCentre.colours;
        this.logos = brandCentre.logos;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  selectPostType(typeId: string): void {
    this.selectedPostType = typeId;
  }

  selectSize(sizeId: string): void {
    this.selectedSize = sizeId;
  }

  selectTemplate(templateId: string): void {
    this.selectedTemplate = this.selectedTemplate === templateId ? null : templateId;
  }

  selectColour(colour: string): void {
    this.selectedColour = this.selectedColour === colour ? null : colour;
  }

  selectBadge(badgeId: string): void {
    this.selectedBadge = this.selectedBadge === badgeId ? null : badgeId;
  }

  selectLogo(logoId: string): void {
    this.selectedLogo = this.selectedLogo === logoId ? null : logoId;
  }

  removeLogo(logoId: string, event: Event): void {
    event.stopPropagation();
    this.logos = this.logos.filter(l => l.id !== logoId);
    if (this.selectedLogo === logoId) {
      this.selectedLogo = null;
    }
  }

  onLogoUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      const newLogo: Logo = {
        id: Date.now().toString(),
        url,
        name: file.name
      };
      this.logos = [...this.logos, newLogo];
      this.selectedLogo = newLogo.id;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  onFileUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      const type = file.type.startsWith('video/') ? 'video' : 'image';
      this.uploadedFiles.push({
        id: Date.now().toString(),
        url,
        type
      });
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  removeUploadedFile(fileId: string): void {
    this.uploadedFiles = this.uploadedFiles.filter(f => f.id !== fileId);
  }

  useAI(): void {
    console.log('Use AI clicked');
  }

  createOrSchedule(): void {
    console.log('Create/Schedule clicked', {
      description: this.postDescription,
      postType: this.selectedPostType,
      size: this.selectedSize,
      template: this.selectedTemplate,
      colour: this.selectedColour,
      badge: this.selectedBadge,
      logo: this.selectedLogo,
      files: this.uploadedFiles
    });
  }

  preview(): void {
    console.log('Preview clicked');
  }

  goBack(): void {
    this.router.navigate(['/activate/social-posts']);
  }
}
