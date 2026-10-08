export type AppMode = 'maker' | 'editor';

// ==========================================
// MODULE 1: IMAGE TO PDF TYPES
// ==========================================
export type PageSizePreset = 'a4' | 'letter' | 'legal' | 'match';
export type PageOrientation = 'portrait' | 'landscape' | 'auto';
export type PageMargin = 'none' | 'compact' | 'normal';
export type ImageFitMode = 'fit' | 'fill';
export type ImageQuality = 'high' | 'medium' | 'web';

export interface ImageItem {
  id: string;
  file: File;
  name: string;
  size: number;
  previewUrl: string;
  width: number;
  height: number;
  rotation: number; // 0, 90, 180, 270
  mirrored: boolean;
  fitMode: ImageFitMode;
}

export interface DocumentSettings {
  pageSize: PageSizePreset;
  orientation: PageOrientation;
  margins: PageMargin;
  quality: ImageQuality;
  customTitle: string;
}

// ==========================================
// MODULE 2: PDF EDITOR TYPES
// ==========================================
export type EditorTool =
  | 'select'
  | 'text'
  | 'check'
  | 'cross'
  | 'symbol'
  | 'pen'
  | 'highlighter'
  | 'rectangle'
  | 'circle'
  | 'arrow'
  | 'line'
  | 'redact'
  | 'whiteout'
  | 'signature'
  | 'stamp'
  | 'eraser';

export interface TextProperties {
  fontFamily: string;
  fontSize: number;
  fill: string;
  isBold: boolean;
  isItalic: boolean;
  isUnderline?: boolean;
  isLinethrough?: boolean;
  textAlign: 'left' | 'center' | 'right';
  backgroundColor: string;
}

export interface DrawingProperties {
  color: string;
  strokeWidth: number;
  opacity: number;
  highlighterColor: string;
  redactColor: 'black' | 'white';
}

export interface ShapeProperties {
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
}

export interface EditorPageInfo {
  pageIndex: number; // 0-based
  pageNumber: number; // 1-based display
  originalPageIndex: number;
  rotation: number; // 0, 90, 180, 270
  width: number;
  height: number;
  aspectRatio: number;
  thumbnailUrl?: string;
  fabricJson?: any; // Serialized annotations
}

export interface PdfDocumentState {
  file: File | null;
  fileName: string;
  fileSize: number;
  arrayBuffer: ArrayBuffer | null;
  totalPages: number;
  pages: EditorPageInfo[];
  currentPageIndex: number;
  zoom: number; // e.g. 1.0 = 100%
  isLoaded: boolean;
  isLoading: boolean;
  hasUnsavedChanges: boolean;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  description?: string;
}
