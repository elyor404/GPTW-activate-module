import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Logo {
  id: string;
  url: string;
  name: string;
}

export interface Favicon {
  id: string;
  url: string;
}

export interface Asset {
  id: string;
  url: string;
  description: string;
  type: 'image' | 'video';
}

export interface ReplacementRule {
  from: string;
  to: string;
  caseSensitive: boolean;
}

export interface BrandVoice {
  personality: string[];
  defaultTone: string[];
  mission: string;
  termsToAvoid: string[];
  replacementRules: ReplacementRule[];
  inclusivityGuidelines: string[];
}

export interface BrandCentre {
  websiteUrl: string;
  colours: string[];
  primaryFont: string;
  secondaryFont: string;
  logos: Logo[];
  favicon: Favicon | null;
  brandVoice: BrandVoice;
  assets: Asset[];
  isSetupComplete: boolean;
}

const MOCK_BRAND_CENTRE: BrandCentre = {
  websiteUrl: 'https://yourcompany.com',
  colours: ['#E8472A', '#1A3C4D', '#2D2D2D'],
  primaryFont: 'Roboto',
  secondaryFont: 'Open Sans',
  logos: [],
  favicon: null,
  brandVoice: {
    personality: ['Trustworthy', 'Supportive', 'Thoughtful'],
    defaultTone: ['Professional', 'Informative', 'Respectful', 'Encouraging'],
    mission: 'Our mission is to help every place become a great place to work for all. We celebrate, enable and inspire leaders and organisations to become great for all people, no matter who they are, what they do, or where they work.',
    termsToAvoid: [],
    replacementRules: [],
    inclusivityGuidelines: []
  },
  assets: [],
  isSetupComplete: false
};

const STORAGE_KEY = 'gptw_brand_centre';

@Injectable({
  providedIn: 'root'
})
export class BrandCentreService {
  private brandCentreSubject: BehaviorSubject<BrandCentre>;

  constructor() {
    const initialState = this.loadFromStorage();
    this.brandCentreSubject = new BehaviorSubject<BrandCentre>(initialState);
  }

  private loadFromStorage(): BrandCentre {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as BrandCentre;
      }
    } catch (e) {
      console.warn('Failed to load brand centre from localStorage:', e);
    }
    return { ...MOCK_BRAND_CENTRE };
  }

  private saveToStorage(state: BrandCentre): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to save brand centre to localStorage:', e);
    }
  }

  private updateState(partial: Partial<BrandCentre>): void {
    const current = this.brandCentreSubject.getValue();
    const updated = { ...current, ...partial };
    this.brandCentreSubject.next(updated);
    this.saveToStorage(updated);
  }

  getBrandCentre(): Observable<BrandCentre> {
    return this.brandCentreSubject.asObservable();
  }

  getCurrentValue(): BrandCentre {
    return this.brandCentreSubject.getValue();
  }

  completeSetup(): void {
    this.updateState({ isSetupComplete: true });
  }

  updateKit(partial: Partial<Pick<BrandCentre, 'websiteUrl' | 'colours' | 'primaryFont' | 'secondaryFont'>>): void {
    this.updateState(partial);
  }

  updateBrandVoice(partial: Partial<BrandVoice>): void {
    const current = this.brandCentreSubject.getValue();
    const updatedVoice = { ...current.brandVoice, ...partial };
    this.updateState({ brandVoice: updatedVoice });
  }

  addLogo(logo: Logo): void {
    const current = this.brandCentreSubject.getValue();
    this.updateState({ logos: [...current.logos, logo] });
  }

  deleteLogo(id: string): void {
    const current = this.brandCentreSubject.getValue();
    this.updateState({ logos: current.logos.filter(l => l.id !== id) });
  }

  updateFavicon(favicon: Favicon | null): void {
    this.updateState({ favicon });
  }

  addAsset(asset: Asset): void {
    const current = this.brandCentreSubject.getValue();
    this.updateState({ assets: [...current.assets, asset] });
  }

  deleteAsset(id: string): void {
    const current = this.brandCentreSubject.getValue();
    this.updateState({ assets: current.assets.filter(a => a.id !== id) });
  }

  updateAssetDescription(id: string, description: string): void {
    const current = this.brandCentreSubject.getValue();
    const updatedAssets = current.assets.map(a =>
      a.id === id ? { ...a, description } : a
    );
    this.updateState({ assets: updatedAssets });
  }

  deleteBrandVoice(): void {
    this.updateState({
      brandVoice: {
        personality: [],
        defaultTone: [],
        mission: '',
        termsToAvoid: [],
        replacementRules: [],
        inclusivityGuidelines: []
      }
    });
  }
}
