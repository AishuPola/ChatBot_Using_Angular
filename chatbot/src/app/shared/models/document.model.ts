export interface UploadedMedia {
  fileName: string;
  fileSize: string;
  fileType: string;
  fileUrl: string | ArrayBuffer | null;
  fileProgessSize: number | string;
  fileProgress: number;
}

export interface DocumentItem {
  id: string;
  name: string;
  category: string;
  type: string;
  created_at: string;
  approved_by: string;
  status: string;
  upload_date: string;

  approved_date: string | null;
}

export interface UploadResponse {
  message: string;
  files: any[];
}

export interface GetDocumentsResponse {
  documents: DocumentItem[];
}
