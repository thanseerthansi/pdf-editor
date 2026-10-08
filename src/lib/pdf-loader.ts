import * as pdfjsLib from 'pdfjs-dist';
import { EditorPageInfo } from '../types';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    new URL('pdfjs-dist/build/pdf.worker.min.js', import.meta.url).toString() ||
    `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
}

/**
 * Loads a PDF document from an ArrayBuffer and extracts page metadata and thumbnail previews
 */
export async function loadPdfDocument(arrayBuffer: ArrayBuffer): Promise<{
  pdfDoc: pdfjsLib.PDFDocumentProxy;
  pages: EditorPageInfo[];
}> {
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
    cMapPacked: true,
  });

  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;
  const pages: EditorPageInfo[] = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale: 1.0 });
    const { width, height } = viewport;

    // Generate thumbnail (scaled down)
    const thumbScale = Math.min(200 / width, 260 / height, 0.5);
    const thumbViewport = page.getViewport({ scale: thumbScale });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    let thumbnailUrl = '';
    if (ctx) {
      canvas.width = Math.floor(thumbViewport.width);
      canvas.height = Math.floor(thumbViewport.height);
      await page.render({
        canvasContext: ctx,
        viewport: thumbViewport,
      }).promise;
      thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8);
    }

    pages.push({
      pageIndex: i - 1,
      pageNumber: i,
      originalPageIndex: i - 1,
      rotation: 0,
      width,
      height,
      aspectRatio: width / height,
      thumbnailUrl,
    });
  }

  return { pdfDoc, pages };
}

/**
 * Renders a specific PDF page to an HTML5 canvas at high-DPI quality
 */
export async function renderPdfPageToCanvas(
  pdfDoc: pdfjsLib.PDFDocumentProxy,
  pageNumber: number,
  targetCanvas: HTMLCanvasElement,
  scale: number = 1.0,
  rotationOffset: number = 0
): Promise<{ viewportWidth: number; viewportHeight: number }> {
  const page = await pdfDoc.getPage(pageNumber);
  const totalRotation = (page.rotate + rotationOffset) % 360;
  
  const dpr = window.devicePixelRatio || 1;
  const viewport = page.getViewport({ scale, rotation: totalRotation });

  const ctx = targetCanvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Could not get 2D canvas context');

  // High-DPI buffer sizing
  targetCanvas.width = Math.floor(viewport.width * dpr);
  targetCanvas.height = Math.floor(viewport.height * dpr);
  targetCanvas.style.width = `${Math.floor(viewport.width)}px`;
  targetCanvas.style.height = `${Math.floor(viewport.height)}px`;

  ctx.save();
  ctx.scale(dpr, dpr);

  await page.render({
    canvasContext: ctx,
    viewport,
  }).promise;

  ctx.restore();

  return {
    viewportWidth: Math.floor(viewport.width),
    viewportHeight: Math.floor(viewport.height),
  };
}

/**
 * Generates an updated thumbnail for a single page with custom rotation
 */
export async function renderPageThumbnail(
  pdfDoc: pdfjsLib.PDFDocumentProxy,
  pageNumber: number,
  rotation: number = 0
): Promise<string> {
  const page = await pdfDoc.getPage(pageNumber);
  const totalRotation = (page.rotate + rotation) % 360;
  const baseViewport = page.getViewport({ scale: 1.0, rotation: totalRotation });

  const thumbScale = Math.min(200 / baseViewport.width, 260 / baseViewport.height, 0.4);
  const viewport = page.getViewport({ scale: thumbScale, rotation: totalRotation });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);

  await page.render({
    canvasContext: ctx,
    viewport,
  }).promise;

  return canvas.toDataURL('image/jpeg', 0.8);
}
