import { PDFDocument, degrees } from 'pdf-lib';
import { DocumentSettings, EditorPageInfo, ImageItem } from '../types';
import { calculateImagePlacement, getPageDimensions, PAGE_MARGINS } from './coordinate-utils';
import { getTransformedImageBytes } from './image-utils';

/**
 * MODULE 1: Compiles a list of images into a multi-page PDF Document using pdf-lib
 */
export async function createPdfFromImages(
  images: ImageItem[],
  settings: DocumentSettings,
  onProgress?: (current: number, total: number) => void
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  if (settings.customTitle) {
    pdfDoc.setTitle(settings.customTitle);
    pdfDoc.setProducer('DocuStudio (https://docustudio.app)');
  }

  const qualityMultiplier =
    settings.quality === 'high' ? 0.95 : settings.quality === 'medium' ? 0.8 : 0.6;
  const marginPt = PAGE_MARGINS[settings.margins];

  for (let i = 0; i < images.length; i++) {
    const item = images[i];
    if (onProgress) {
      onProgress(i + 1, images.length);
    }

    // Transform and get image bytes
    const transformed = await getTransformedImageBytes(item, qualityMultiplier);

    // Embed image in PDF
    const embeddedImage =
      transformed.format === 'png'
        ? await pdfDoc.embedPng(transformed.bytes)
        : await pdfDoc.embedJpg(transformed.bytes);

    // Determine page dimensions
    const pageDims = getPageDimensions(
      settings.pageSize,
      settings.orientation,
      transformed.width,
      transformed.height
    );

    const page = pdfDoc.addPage([pageDims.width, pageDims.height]);

    // Calculate centered placement with margins
    const placement = calculateImagePlacement(
      pageDims.width,
      pageDims.height,
      transformed.width,
      transformed.height,
      marginPt,
      item.fitMode
    );

    page.drawImage(embeddedImage, {
      x: placement.x,
      y: placement.y,
      width: placement.width,
      height: placement.height,
    });
  }

  return await pdfDoc.save();
}

/**
 * MODULE 2: Export modified PDF with reordered pages, rotations, and baked-in canvas annotations
 */
export async function exportModifiedPdf(
  originalArrayBuffer: ArrayBuffer,
  pages: EditorPageInfo[],
  pageAnnotationOverlays: Record<number, string>, // pageIndex -> PNG DataURL
  onProgress?: (current: number, total: number) => void
): Promise<Uint8Array> {
  const sourceDoc = await PDFDocument.load(originalArrayBuffer);
  const outDoc = await PDFDocument.create();

  for (let i = 0; i < pages.length; i++) {
    const pageInfo = pages[i];
    if (onProgress) {
      onProgress(i + 1, pages.length);
    }

    // Copy original page
    const [copiedPage] = await outDoc.copyPages(sourceDoc, [pageInfo.originalPageIndex]);
    
    // Apply page rotation if any
    const existingRotation = copiedPage.getRotation().angle;
    const finalRotation = (existingRotation + pageInfo.rotation) % 360;
    copiedPage.setRotation(degrees(finalRotation));

    // Get page dimensions
    const { width, height } = copiedPage.getSize();

    // Check if there are annotations for this page
    const overlayDataUrl = pageAnnotationOverlays[pageInfo.pageIndex];
    if (overlayDataUrl && overlayDataUrl.length > 50) {
      try {
        const base64Data = overlayDataUrl.split(',')[1];
        const binaryStr = atob(base64Data);
        const bytes = new Uint8Array(binaryStr.length);
        for (let j = 0; j < binaryStr.length; j++) {
          bytes[j] = binaryStr.charCodeAt(j);
        }

        const embeddedOverlay = await outDoc.embedPng(bytes);

        // Draw annotation overlay covering entire page
        copiedPage.drawImage(embeddedOverlay, {
          x: 0,
          y: 0,
          width: width,
          height: height,
        });
      } catch (err) {
        console.error('Failed to embed overlay for page', pageInfo.pageNumber, err);
      }
    }

    outDoc.addPage(copiedPage);
  }

  return await outDoc.save();
}

/**
 * Helper to trigger browser download of a generated PDF
 */
export function downloadPdfBlob(bytes: Uint8Array, filename: string = 'document.pdf'): void {
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
