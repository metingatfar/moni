export interface VisionInput {
  id: string;
  source: 'camera' | 'uploaded_image' | 'screenshot' | 'document_image' | 'pdf_page_image' | 'clipboard_image';
  mimeType: string;
  fileName: string;
  createdAt: string;
  width: number;
  height: number;
  size: number;
  localUri: string;
  privacyLevel: 'private' | 'public' | 'sensitive';
}
