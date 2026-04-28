import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface PostPreviewData {
  description: string;
  postType: string;
  size: string;
  templateUrl: string | null;
  colour: string | null;
  badgeUrl: string | null;
  logoUrl: string | null;
  uploadedFiles: { id: string; url: string; type: 'image' | 'video' }[];
}

export interface PostFormState {
  postDescription: string;
  selectedPostType: string;
  selectedSize: string;
  selectedTemplate: string | null;
  selectedColour: string | null;
  selectedBadge: string | null;
  selectedLogo: string | null;
  uploadedFiles: { id: string; url: string; type: 'image' | 'video' }[];
}

const INITIAL_DATA: PostPreviewData = {
  description: '',
  postType: 'text',
  size: 'story',
  templateUrl: null,
  colour: null,
  badgeUrl: null,
  logoUrl: null,
  uploadedFiles: []
};

const INITIAL_FORM_STATE: PostFormState = {
  postDescription: '',
  selectedPostType: 'text',
  selectedSize: 'story',
  selectedTemplate: null,
  selectedColour: null,
  selectedBadge: null,
  selectedLogo: null,
  uploadedFiles: []
};

@Injectable({
  providedIn: 'root'
})
export class PostPreviewService {
  private previewDataSubject = new BehaviorSubject<PostPreviewData>(INITIAL_DATA);
  private formStateSubject = new BehaviorSubject<PostFormState>(INITIAL_FORM_STATE);

  setPreviewData(data: PostPreviewData): void {
    this.previewDataSubject.next(data);
  }

  getPreviewData(): Observable<PostPreviewData> {
    return this.previewDataSubject.asObservable();
  }

  getCurrentData(): PostPreviewData {
    return this.previewDataSubject.getValue();
  }

  setFormState(state: PostFormState): void {
    this.formStateSubject.next(state);
  }

  getFormState(): PostFormState {
    return this.formStateSubject.getValue();
  }

  hasFormState(): boolean {
    const state = this.formStateSubject.getValue();
    return state.postDescription !== '' || 
           state.selectedTemplate !== null || 
           state.selectedColour !== null ||
           state.selectedBadge !== null ||
           state.selectedLogo !== null ||
           state.uploadedFiles.length > 0;
  }

  clearData(): void {
    this.previewDataSubject.next(INITIAL_DATA);
    this.formStateSubject.next(INITIAL_FORM_STATE);
  }
}
