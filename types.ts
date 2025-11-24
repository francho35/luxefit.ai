export interface ImageState {
  file: File | null;
  preview: string | null;
  base64: string | null; // Base64 without prefix for API
  mimeType: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

export interface GenerateOutfitParams {
  modelImage: ImageState;
  outfitImage: ImageState;
}