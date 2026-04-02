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
}

export interface UploadResponse {
  message: string;
  files: any[];
}
