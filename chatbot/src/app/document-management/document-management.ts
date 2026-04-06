import { ChangeDetectorRef, Component } from '@angular/core';
import { DocumentItem, UploadedMedia } from '../shared/models/document.model';
import { firstValueFrom } from 'rxjs';
import { Api } from '../shared/services/api';
import { Local } from '../shared/services/local';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DeleteConfirmation } from '../shared/components/delete-confirmation/delete-confirmation';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
@Component({
  selector: 'app-document-management',
  imports: [FormsModule, IonicModule, DeleteConfirmation, CommonModule, ReactiveFormsModule],
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
  //public selectedType: string = '';

  public isUploading: boolean = false;
  public uploadError: string = '';

  //for delete confirmation:
  public showDeleteConfirm: boolean = false;
  public selectedDocId: string = '';
  public isDeleting: boolean = false;
  public deleteErrorMessage: string = '';
  //for previewing file
  public showPreview: boolean = false;
  public previewFile: any = null;

  public uploadForm: FormGroup = new FormGroup({
    type: new FormControl('', Validators.required),
  });
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
    //this.selectedType = '';
    this.uploadForm.reset();
  }

  // public onFileSelect(event: Event): void {
  //   const input = event.target as HTMLInputElement;

  //   if (!input.files || input.files.length === 0) return;

  //   const filesArray = Array.from(input.files);
  //   this.uploadError = '';

  //   // Check if the file already exists in the documents list
  //   for (let file of filesArray) {
  //     const isDuplicate = this.documents.some((doc) => doc.name === file.name);
  //     if (isDuplicate) {
  //       this.uploadError = `Error: Document "${file.name}" already exists.`;
  //       this.selectedFiles = [];
  //       this.uploadedFiles = [];
  //       input.value = ''; // Reset input
  //       return;
  //     }
  //   }

  //   this.selectedFiles = filesArray;
  //   this.uploadedFiles = [];

  //   this.selectedFiles.forEach((file) => {
  //     const reader = new FileReader();

  //     reader.onload = (e) => {
  //       this.uploadedFiles.push({
  //         fileName: file.name,
  //         fileSize: (file.size / 1024).toFixed(2) + ' KB',
  //         fileType: file.type,
  //         fileUrl: e.target?.result || null,
  //         fileProgessSize: 0,
  //         fileProgress: 0,
  //       });
  //       // Force view to update immediately so the file name displays
  //       this.cdr.detectChanges();
  //     };

  //     reader.readAsDataURL(file);
  //   });

  //   input.value = ''; // Reset input so the same file can be selected again if removed
  // }

  public onFileSelect(event: Event): void {
    //User selects file → event triggers
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const filesArray = Array.from(input.files);

    //converts filelist(all files) into usable array.
    this.uploadError = '';

    const allowedTypes = ['application/pdf', 'image/png'];

    for (let file of filesArray) {
      //  FILE TYPE VALIDATION
      if (!allowedTypes.includes(file.type)) {
        this.uploadError = 'Only PDF and PNG files are allowed';
        this.resetFileInput(input);
        return;
      }

      //  TYPE MATCH VALIDATION
      // if (this.selectedType && !file.type.includes(this.selectedType)) {
      //   this.uploadError = `You selected ${this.selectedType.toUpperCase()} but uploaded wrong file type`;
      //   this.resetFileInput(input);
      //   return;
      // }// using ngmodel

      const selectedType = this.uploadForm.get('type')?.value;

      if (selectedType && !file.type.includes(selectedType)) {
        this.uploadError = `You selected ${selectedType.toUpperCase()} but uploaded wrong file type`;
        this.resetFileInput(input);
        return;
      }
      // DUPLICATE CHECK
      const isDuplicate = this.documents.some((doc) => doc.name === file.name);
      if (isDuplicate) {
        this.uploadError = `File "${file.name}" already exists`;
        this.resetFileInput(input);
        return;
      }
    }

    this.selectedFiles = filesArray;
    this.uploadedFiles = [];

    filesArray.forEach((file) => {
      //   readAsDataURL(file)

      //  This creates a base64 URL

      //  Problem with base64:
      // Works inconsistently in new tabs
      // Large files (PDF) may fail
      // Browser sometimes blocks rendering
      // so we use const fileUrl = URL.createObjectURL(file);
      const fileUrl = URL.createObjectURL(file);

      this.uploadedFiles.push({
        fileName: file.name,
        fileSize: (file.size / 1024).toFixed(2) + ' KB',
        fileType: file.type,
        fileUrl: fileUrl, // for preview
        fileProgessSize: 0,
        fileProgress: 0,
      });
      this.cdr.detectChanges();
    });

    this.cdr.detectChanges();
  }

  private resetFileInput(input: HTMLInputElement): void {
    input.value = '';
    this.selectedFiles = []; //nothing shown
    this.uploadedFiles = []; //preview disappers
  }

  public removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.uploadedFiles.splice(index, 1);
    //remove items from both arrays.
    //The splice() method of Array instances changes the contents of an array by
    // removing or replacing existing elements and/or adding new elements in place
  }

  public async uploadDocuments(): Promise<void> {
    try {
      this.isUploading = true;
      this.uploadError = '';

      // if (!this.selectedType) {
      //   this.uploadError = 'Please select a document template type.';
      //   return;
      // }// via using ngmodel

      const selectedType = this.uploadForm.get('type')?.value;

      if (!selectedType) {
        this.uploadError = 'Please select a document template type.';
        return;
      }

      if (!this.selectedFiles.length) {
        this.uploadError = 'Please select a file';
        return;
      }

      //FormData is a special JavaScript object
      // used to send data to backend in multipart format.
      const formData = new FormData();

      this.selectedFiles.forEach((file) => {
        formData.append('files', file);
        // internally it becomes Content-Type: multipart/form-data
      });

      // formData.append('category', this.selectedType);// via ngmodel.

      formData.append('category', selectedType);
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
      this.documents = (res.documents || []).map((doc: any) => {
        const status = doc.status?.toLowerCase();
        return {
          ...doc,

          // FLAG (no logic in HTML anymore)
          statusClass:
            status === 'approved'
              ? 'approved'
              : status?.includes('process')
                ? 'processing'
                : status === 'rejected'
                  ? 'rejected'
                  : '',
        };
      });
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Failed to load documents', error);
    }
  }

  public async deleteDocument(docId: string): Promise<void> {
    try {
      await firstValueFrom(this.api.deleteDocument(docId));

      //  Remove from UI instantly
      this.documents = this.documents.filter((doc) => doc.id !== docId);

      this.cdr.detectChanges();
    } catch (error) {
      //console.error('Delete failed', error);
      this.uploadError = 'Failed to delete document';
    }
  }

  public async ngOnInit(): Promise<void> {
    await this.loadDocuments();
    this.cdr.detectChanges();
  }

  public openDeleteConfirm(id: string): void {
    this.selectedDocId = id;
    this.showDeleteConfirm = true;
  }

  public cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.deleteErrorMessage = '';
  }

  public async confirmDelete(): Promise<void> {
    try {
      this.isDeleting = true;

      await firstValueFrom(this.api.deleteDocument(this.selectedDocId));

      this.documents = this.documents.filter((doc) => doc.id !== this.selectedDocId);
      this.cancelDelete();
      await this.loadDocuments();
      this.cdr.detectChanges();
      // this.cancelDelete();
    } catch (error) {
      this.deleteErrorMessage = 'Failed to delete document';
    } finally {
      this.isDeleting = false;
    }
  }

  //open in new tab

  public openInNewTab(file: any): void {
    if (!file.fileUrl) return;
    const url =
      typeof file.fileUrl === 'string'
        ? file.fileUrl
        : URL.createObjectURL(new Blob([file.fileUrl]));

    window.open(url, '_blank');
  }

  // for showing data from get documents api.

  public formatDate(dateStr: string | null): Date | null {
    if (!dateStr) return null;

    const [day, month, year] = dateStr.split('-');
    return new Date(+year, +month - 1, +day);
  }
}
