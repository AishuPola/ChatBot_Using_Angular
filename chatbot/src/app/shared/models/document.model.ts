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

export interface AccessControlInfo {
  access_type: string;
  documents_searched: string[];
  user_role: string;
  note: string;
}

export interface SearchStats {
  documents_searched: number;
  chunks_found: number;
  store_type: string;
}

export interface DocumentQueryResponse {
  answer: string;
  success: boolean;
  has_answer: boolean;
  scope: string;
  access_control_info: AccessControlInfo;
  search_stats: SearchStats;
  similarity_info: string;
  user: string;
}
