import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface PostPreviewData {
  description: string;
  postType: string | null;
  size: string | null;
  templateUrl: string | null;
  colour: string | null;
  badgeUrl: string | null;
  logoUrl: string | null;
  uploadedFiles: { id: string; url: string; type: 'image' | 'video' }[];
  canvasState?: any;
}

export interface PostFormState {
  postDescription: string;
  selectedPostType: string | null;
  selectedSize: string | null;
  selectedTemplate: string | null;
  selectedColour: string | null;
  selectedBadge: string | null;
  selectedLogo: string | null;
  uploadedFiles: { id: string; url: string; type: 'image' | 'video' }[];
  canvasState?: any;
}

const INITIAL_DATA: PostPreviewData = {
  description: '',
  postType: null,
  size: null,
  templateUrl: null,
  colour: null,
  badgeUrl: null,
  logoUrl: null,
  uploadedFiles: []
};

const INITIAL_FORM_STATE: PostFormState = {
  postDescription: '',
  selectedPostType: null,
  selectedSize: null,
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

  /** True when the user opened the editor by clicking "Edit" on an existing dashboard post. */
  private _editMode = false;
  private _postId?: number;

  get editMode(): boolean {
    return this._editMode;
  }

  setEditMode(value: boolean): void {
    this._editMode = value;
  }

  get postId(): number | undefined {
    return this._postId;
  }

  setPostId(id: number | undefined): void {
    this._postId = id;
  }

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
           state.selectedPostType !== null ||
           state.selectedSize !== null ||
           state.selectedTemplate !== null || 
           state.selectedColour !== null ||
           state.selectedBadge !== null ||
           state.selectedLogo !== null ||
           state.uploadedFiles.length > 0;
  }

  clearData(): void {
    this.previewDataSubject.next(INITIAL_DATA);
    this.formStateSubject.next(INITIAL_FORM_STATE);
    this._editMode = false;
    this._postId = undefined;
  }
}
