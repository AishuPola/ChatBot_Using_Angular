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
  public documents: any[] = [];

  // Set to empty string so the placeholder option shows by default
  public selectedType: string = '';

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
    this.selectedType = '';
  }

  public onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) return;

    const filesArray = Array.from(input.files);
    this.uploadError = '';

    // Check if the file already exists in the documents list
    for (let file of filesArray) {
      const isDuplicate = this.documents.some((doc) => doc.name === file.name);
      if (isDuplicate) {
        this.uploadError = `Error: Document "${file.name}" already exists.`;
        this.selectedFiles = [];
        this.uploadedFiles = [];
        input.value = ''; // Reset input
        return;
      }
    }

    this.selectedFiles = filesArray;
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
        // Force view to update immediately so the file name displays
        this.cdr.detectChanges();
      };

      reader.readAsDataURL(file);
    });

    input.value = ''; // Reset input so the same file can be selected again if removed
  }

  public async uploadDocuments(): Promise<void> {
    try {
      this.isUploading = true;
      this.uploadError = '';

      if (!this.selectedType) {
        this.uploadError = 'Please select a document template type.';
        return;
      }

      if (!this.selectedFiles.length) {
        this.uploadError = 'Please select a file';
        return;
      }

      const formData = new FormData();

      this.selectedFiles.forEach((file) => {
        formData.append('files', file);
      });

      formData.append('category', this.selectedType);
      formData.append('tags', '');

      const res = await firstValueFrom(this.api.uploadDocuments(formData));
      console.log('upload response', res);

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
      this.documents = res.documents || [];
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Failed to load documents', error);
    }
  }

  public deleteDocument(docId: string): void {
    // Optional: Call your delete API here
    // await firstValueFrom(this.api.deleteDocument(docId));

    // Remove from local array
    this.documents = this.documents.filter((doc) => doc.id !== docId);
    this.cdr.detectChanges();
  }

  public async ngOnInit(): Promise<void> {
    await this.loadDocuments();
    this.cdr.detectChanges();
  }
}
