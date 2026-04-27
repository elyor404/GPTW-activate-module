import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface Template {
  id: string;
  imageUrl: string;
}

interface BadgeOption {
  id: string;
  bgColor: string;
  textColor: string;
  certColor: string;
}

@Component({
  selector: 'app-create-post-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-post-page.html',
  styleUrl: './create-post-page.scss'
})
export class CreatePostPageComponent {
  postDescription = '';
  
  selectedPostType = 'text';
  selectedSize = 'story';
  selectedTemplate: string | null = null;
  selectedColour: string | null = null;
  selectedBadge: string | null = null;
  selectedLogo: string | null = null;

  templates: Template[] = [
    { id: '1', imageUrl: '/posts/post1.svg' },
    { id: '2', imageUrl: '/posts/Facebook post - 1.svg' },
    { id: '3', imageUrl: '/posts/Instagram story - 1.svg' },
    { id: '4', imageUrl: '/posts/post1.svg' },
    { id: '5', imageUrl: '/posts/Facebook post - 1.svg' },
    { id: '6', imageUrl: '/posts/Instagram story - 1.svg' }
  ];

  colours = [
    '#E8472A', '#FF6B35', '#F7931E', '#FFCD00', '#8DC63F', '#39B54A', '#00A79D', '#00BCD4',
    '#2196F3', '#673AB7', '#9C27B0', '#E91E63', '#90CAF9', '#7E57C2', '#26A69A', '#80DEEA'
  ];

  badges: BadgeOption[] = [
    { id: '1', bgColor: '#1A3C4D', textColor: '#E8472A', certColor: '#FFFFFF' },
    { id: '2', bgColor: '#FFFFFF', textColor: '#E8472A', certColor: '#1A3C4D' },
    { id: '3', bgColor: '#E8472A', textColor: '#FFFFFF', certColor: '#FFFFFF' },
    { id: '4', bgColor: '#E5E5E5', textColor: '#E8472A', certColor: '#333333' },
    { id: '5', bgColor: '#2D2D2D', textColor: '#E8472A', certColor: '#FFFFFF' }
  ];

  uploadedFiles: { id: string; url: string; type: 'image' | 'video' }[] = [
    { id: 'default1', url: '/posts/post1.svg', type: 'image' },
    { id: 'default2', url: '/posts/Facebook post - 1.svg', type: 'image' }
  ];

  constructor(private router: Router) {}

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
