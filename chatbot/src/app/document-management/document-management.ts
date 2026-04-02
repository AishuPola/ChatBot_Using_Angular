import { ChangeDetectorRef, Component } from '@angular/core';
import { DocumentItem, UploadedMedia } from '../shared/models/document.model';
import { firstValueFrom } from 'rxjs';
import { Api } from '../shared/services/api';
import { Local } from '../shared/services/local';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-document-management',
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './document-management.html',
  styleUrl: './document-management.scss',
})
export class DocumentManagement {
  constructor(
    private api: Api,
    private local: Local,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}
  public showModal: boolean = false;

  public selectedFiles: File[] = [];
  public uploadedFiles: UploadedMedia[] = [];

  public documents: DocumentItem[] = [];

  public selectedType: string = 'pdf';

  public isUploading: boolean = false;
  public uploadError: string = '';

  public openModal(): void {
    this.showModal = true;
    this.resetForm();
  }

  public closeModal(): void {
    this.showModal = false;
    this.resetForm();
  }

  private resetForm(): void {
    this.selectedFiles = [];
    this.uploadedFiles = [];
    this.uploadError = '';
    this.selectedType = 'pdf';
  }

  public onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files) return;

    this.selectedFiles = Array.from(input.files);

    this.uploadedFiles = [];

    this.selectedFiles.forEach((file) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        this.uploadedFiles.push({
          fileName: file.name,
          fileSize: (file.size / 1024).toFixed(2) + ' KB',
          fileType: file.type,
          fileUrl: e.target?.result || null,
          fileProgessSize: 0,
          fileProgress: 0,
        });
      };

      reader.readAsDataURL(file);
    });
  }

  public async uploadDocuments(): Promise<void> {
    if (!this.selectedFiles.length) {
      this.uploadError = 'Please select a file';
      return;
    }

    try {
      this.isUploading = true;

      const formData = new FormData();

      this.selectedFiles.forEach((file) => {
        formData.append('files', file);
      });

      formData.append('category', this.selectedType);
      formData.append('tags', '');

      await firstValueFrom(this.api.uploadDocuments(formData));

      this.closeModal();
      await this.loadDocuments();
      this.cdr.detectChanges();
    } catch (err: any) {
      this.uploadError = err?.error?.message || 'Upload failed';
    } finally {
      this.isUploading = false;
    }
  }

  public async loadDocuments(): Promise<void> {
    try {
      const res = await firstValueFrom(this.api.getDocuments());
      this.documents = res.files || [];
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Failed to load documents', error);
    }
  }

  public async ngOnInit(): Promise<void> {
    await this.loadDocuments();
    this.cdr.detectChanges();
  }
}
