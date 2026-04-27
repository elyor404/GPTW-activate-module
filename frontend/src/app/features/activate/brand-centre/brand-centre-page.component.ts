import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import {
  BrandCentreService,
  BrandCentre,
  Logo,
  Asset,
  ReplacementRule
} from '../../../core/services/brand-centre.service';

@Component({
  selector: 'app-brand-centre-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './brand-centre-page.component.html',
  styleUrl: './brand-centre-page.component.scss'
})
export class BrandCentrePageComponent implements OnInit, OnDestroy {
  @ViewChild('logoInput') logoInput!: ElementRef<HTMLInputElement>;
  @ViewChild('faviconInput') faviconInput!: ElementRef<HTMLInputElement>;
  @ViewChild('assetInput') assetInput!: ElementRef<HTMLInputElement>;

  private destroy$ = new Subject<void>();

  brandCentre!: BrandCentre;
  brandKitForm!: FormGroup;
  missionControl!: FormControl;

  newPersonalityInput = '';
  newToneInput = '';
  addingPersonality = false;
  addingTone = false;

  addingTermToAvoid = false;
  newTermToAvoid = '';

  addingReplacementRule = false;
  newRuleFrom = '';
  newRuleTo = '';
  newRuleCaseSensitive = true;

  addingInclusivity = false;
  newInclusivity = '';

  assetToDelete: string | null = null;

  showDeleteVoiceModal = false;
  showSaveSnackbar = false;
  snackbarKey = 0;

  availableFonts = [
    'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins',
    'Inter', 'Raleway', 'Nunito', 'Playfair Display', 'Merriweather',
    'Ubuntu', 'Source Sans Pro', 'Oswald', 'PT Sans', 'Noto Sans'
  ];

  presetColours = [
    '#FF0000', '#FF6600', '#FFCC00', '#33CC33', '#00CCCC', '#0066FF',
    '#6600CC', '#FF0099', '#FFFFFF', '#CCCCCC', '#666666', '#000000'
  ];

  loadedFonts = new Set<string>();

  constructor(
    private brandCentreService: BrandCentreService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForms();

    this.brandCentreService.getBrandCentre()
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.brandCentre = state;
        this.populateForms(state);
        this.loadGoogleFont(state.primaryFont);
        this.loadGoogleFont(state.secondaryFont);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForms(): void {
    this.brandKitForm = this.fb.group({
      websiteUrl: ['', [Validators.pattern(/^https?:\/\/.+/)]],
      primaryFont: ['Roboto'],
      secondaryFont: ['Open Sans']
    });

    this.missionControl = new FormControl('');
  }

  private populateForms(state: BrandCentre): void {
    this.brandKitForm.patchValue({
      websiteUrl: state.websiteUrl,
      primaryFont: state.primaryFont,
      secondaryFont: state.secondaryFont
    }, { emitEvent: false });

    this.missionControl.setValue(state.brandVoice.mission, { emitEvent: false });
  }

  private uuid(): string {
    return 'id-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
  }

  private async readFileAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  loadGoogleFont(fontName: string): void {
    if (!fontName || this.loadedFonts.has(fontName)) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}:wght@400;700&display=swap`;
    document.head.appendChild(link);
    this.loadedFonts.add(fontName);
  }

  startBrandSetup(): void {
    this.brandCentreService.completeSetup();
  }

  onWebsiteUrlBlur(): void {
    const value = this.brandKitForm.get('websiteUrl')?.value;
    if (this.brandKitForm.get('websiteUrl')?.valid) {
      this.brandCentreService.updateKit({ websiteUrl: value });
    }
  }

  onPrimaryFontChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.loadGoogleFont(value);
    this.brandCentreService.updateKit({ primaryFont: value });
  }

  onSecondaryFontChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.loadGoogleFont(value);
    this.brandCentreService.updateKit({ secondaryFont: value });
  }

  triggerLogoUpload(): void {
    this.logoInput?.nativeElement.click();
  }

  async onLogoUpload(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const base64 = await this.readFileAsBase64(file);
    const logo: Logo = {
      id: this.uuid(),
      url: base64,
      name: file.name
    };
    this.brandCentreService.addLogo(logo);
    input.value = '';
  }

  deleteLogo(id: string): void {
    this.brandCentreService.deleteLogo(id);
  }

  triggerFaviconUpload(): void {
    this.faviconInput?.nativeElement.click();
  }

  async onFaviconUpload(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const base64 = await this.readFileAsBase64(file);
    this.brandCentreService.updateFavicon({
      id: this.uuid(),
      url: base64
    });
    input.value = '';
  }

  deleteFavicon(): void {
    this.brandCentreService.updateFavicon(null);
  }

  onColourChange(index: number, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    const colours = [...this.brandCentre.colours];
    colours[index] = value;
    this.brandCentreService.updateKit({ colours });
  }

  addColour(): void {
    const colours = [...this.brandCentre.colours, '#CCCCCC'];
    this.brandCentreService.updateKit({ colours });
  }

  removeColour(index: number): void {
    const colours = this.brandCentre.colours.filter((_, i) => i !== index);
    this.brandCentreService.updateKit({ colours });
  }

  addPresetColour(colour: string): void {
    if (!this.brandCentre.colours.includes(colour)) {
      const colours = [...this.brandCentre.colours, colour];
      this.brandCentreService.updateKit({ colours });
    }
  }

  startAddPersonality(): void {
    this.addingPersonality = true;
    this.newPersonalityInput = '';
  }

  cancelAddPersonality(): void {
    this.addingPersonality = false;
    this.newPersonalityInput = '';
  }

  savePersonality(): void {
    if (this.newPersonalityInput.trim()) {
      const personality = [...this.brandCentre.brandVoice.personality, this.newPersonalityInput.trim()];
      this.brandCentreService.updateBrandVoice({ personality });
    }
    this.cancelAddPersonality();
  }

  onPersonalityKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.savePersonality();
    } else if (event.key === 'Escape') {
      this.cancelAddPersonality();
    }
  }

  removePersonality(index: number): void {
    const personality = this.brandCentre.brandVoice.personality.filter((_, i) => i !== index);
    this.brandCentreService.updateBrandVoice({ personality });
  }

  startAddTone(): void {
    this.addingTone = true;
    this.newToneInput = '';
  }

  cancelAddTone(): void {
    this.addingTone = false;
    this.newToneInput = '';
  }

  saveTone(): void {
    if (this.newToneInput.trim()) {
      const defaultTone = [...this.brandCentre.brandVoice.defaultTone, this.newToneInput.trim()];
      this.brandCentreService.updateBrandVoice({ defaultTone });
    }
    this.cancelAddTone();
  }

  onToneKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.saveTone();
    } else if (event.key === 'Escape') {
      this.cancelAddTone();
    }
  }

  removeTone(index: number): void {
    const defaultTone = this.brandCentre.brandVoice.defaultTone.filter((_, i) => i !== index);
    this.brandCentreService.updateBrandVoice({ defaultTone });
  }

  onMissionBlur(): void {
    this.brandCentreService.updateBrandVoice({ mission: this.missionControl.value });
  }

  startAddTermToAvoid(): void {
    this.addingTermToAvoid = true;
    this.newTermToAvoid = '';
  }

  cancelAddTermToAvoid(): void {
    this.addingTermToAvoid = false;
    this.newTermToAvoid = '';
  }

  saveTermToAvoid(): void {
    if (this.newTermToAvoid.trim()) {
      const termsToAvoid = [...this.brandCentre.brandVoice.termsToAvoid, this.newTermToAvoid.trim()];
      this.brandCentreService.updateBrandVoice({ termsToAvoid });
    }
    this.cancelAddTermToAvoid();
  }

  onTermToAvoidKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.saveTermToAvoid();
    } else if (event.key === 'Escape') {
      this.cancelAddTermToAvoid();
    }
  }

  removeTermToAvoid(index: number): void {
    const termsToAvoid = this.brandCentre.brandVoice.termsToAvoid.filter((_, i) => i !== index);
    this.brandCentreService.updateBrandVoice({ termsToAvoid });
  }

  startAddReplacementRule(): void {
    this.addingReplacementRule = true;
    this.newRuleFrom = '';
    this.newRuleTo = '';
    this.newRuleCaseSensitive = true;
  }

  cancelAddReplacementRule(): void {
    this.addingReplacementRule = false;
  }

  saveReplacementRule(): void {
    if (this.newRuleFrom.trim() && this.newRuleTo.trim()) {
      const rule: ReplacementRule = {
        from: this.newRuleFrom.trim(),
        to: this.newRuleTo.trim(),
        caseSensitive: this.newRuleCaseSensitive
      };
      const replacementRules = [...this.brandCentre.brandVoice.replacementRules, rule];
      this.brandCentreService.updateBrandVoice({ replacementRules });
    }
    this.cancelAddReplacementRule();
  }

  removeReplacementRule(index: number): void {
    const replacementRules = this.brandCentre.brandVoice.replacementRules.filter((_, i) => i !== index);
    this.brandCentreService.updateBrandVoice({ replacementRules });
  }

  startAddInclusivity(): void {
    this.addingInclusivity = true;
    this.newInclusivity = '';
  }

  cancelAddInclusivity(): void {
    this.addingInclusivity = false;
    this.newInclusivity = '';
  }

  saveInclusivity(): void {
    if (this.newInclusivity.trim()) {
      const inclusivityGuidelines = [...this.brandCentre.brandVoice.inclusivityGuidelines, this.newInclusivity.trim()];
      this.brandCentreService.updateBrandVoice({ inclusivityGuidelines });
    }
    this.cancelAddInclusivity();
  }

  onInclusivityKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.saveInclusivity();
    } else if (event.key === 'Escape') {
      this.cancelAddInclusivity();
    }
  }

  removeInclusivity(index: number): void {
    const inclusivityGuidelines = this.brandCentre.brandVoice.inclusivityGuidelines.filter((_, i) => i !== index);
    this.brandCentreService.updateBrandVoice({ inclusivityGuidelines });
  }

  openDeleteVoiceModal(): void {
    this.showDeleteVoiceModal = true;
  }

  closeDeleteVoiceModal(): void {
    this.showDeleteVoiceModal = false;
  }

  confirmDeleteBrandVoice(): void {
    this.brandCentreService.deleteBrandVoice();
    this.missionControl.setValue('');
    this.closeDeleteVoiceModal();
  }

  triggerAssetUpload(): void {
    this.assetInput?.nativeElement.click();
  }

  async onAssetUpload(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const base64 = await this.readFileAsBase64(file);
    const isVideo = file.type.startsWith('video/');

    const asset: Asset = {
      id: this.uuid(),
      url: base64,
      description: '',
      type: isVideo ? 'video' : 'image'
    };

    this.brandCentreService.addAsset(asset);
    input.value = '';
  }

  onAssetDescriptionBlur(assetId: string, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.brandCentreService.updateAssetDescription(assetId, value);
  }

  promptDeleteAsset(id: string): void {
    this.assetToDelete = id;
  }

  cancelDeleteAsset(): void {
    this.assetToDelete = null;
  }

  confirmDeleteAsset(): void {
    if (this.assetToDelete) {
      this.brandCentreService.deleteAsset(this.assetToDelete);
      this.assetToDelete = null;
    }
  }

  saveAllInfo(): void {
    console.log('Brand Centre data saved:', this.brandCentre);
    this.snackbarKey++;
    this.showSaveSnackbar = true;
  }

  onSnackbarAnimationEnd(): void {
    this.showSaveSnackbar = false;
  }
}
