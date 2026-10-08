import { PageMargin, PageOrientation, PageSizePreset } from '../types';

export const PAGE_SIZES: Record<Exclude<PageSizePreset, 'match'>, { width: number; height: number }> = {
  a4: { width: 595.28, height: 841.89 },
  letter: { width: 612.0, height: 792.0 },
  legal: { width: 612.0, height: 1008.0 },
};

export const PAGE_MARGINS: Record<PageMargin, number> = {
  none: 0,
  compact: 18,
  normal: 36,
};

/**
 * Calculates target page dimensions in points based on size preset, orientation, and image aspect ratio
 */
export function getPageDimensions(
  preset: PageSizePreset,
  orientation: PageOrientation,
  imgWidth: number,
  imgHeight: number
): { width: number; height: number } {
  if (preset === 'match') {
    // 72 DPI representation of image
    return { width: imgWidth * 0.75, height: imgHeight * 0.75 };
  }

  const standard = PAGE_SIZES[preset];
  let targetWidth = standard.width;
  let targetHeight = standard.height;

  if (orientation === 'landscape') {
    targetWidth = Math.max(standard.width, standard.height);
    targetHeight = Math.min(standard.width, standard.height);
  } else if (orientation === 'portrait') {
    targetWidth = Math.min(standard.width, standard.height);
    targetHeight = Math.max(standard.width, standard.height);
  } else if (orientation === 'auto') {
    // Match image orientation
    const isImageLandscape = imgWidth > imgHeight;
    if (isImageLandscape) {
      targetWidth = Math.max(standard.width, standard.height);
      targetHeight = Math.min(standard.width, standard.height);
    } else {
      targetWidth = Math.min(standard.width, standard.height);
      targetHeight = Math.max(standard.width, standard.height);
    }
  }

  return { width: targetWidth, height: targetHeight };
}

/**
 * Calculates image placement coordinates & dimensions within a page taking margins and fit mode into account
 */
export function calculateImagePlacement(
  pageWidth: number,
  pageHeight: number,
  imgWidth: number,
  imgHeight: number,
  marginPt: number,
  fitMode: 'fit' | 'fill'
): { x: number; y: number; width: number; height: number } {
  const printableWidth = Math.max(10, pageWidth - marginPt * 2);
  const printableHeight = Math.max(10, pageHeight - marginPt * 2);

  const imgRatio = imgWidth / imgHeight;
  const printRatio = printableWidth / printableHeight;

  let finalWidth = printableWidth;
  let finalHeight = printableHeight;

  if (fitMode === 'fit') {
    if (imgRatio > printRatio) {
      // Wider than box
      finalWidth = printableWidth;
      finalHeight = printableWidth / imgRatio;
    } else {
      // Taller than box
      finalHeight = printableHeight;
      finalWidth = printableHeight * imgRatio;
    }
  } else {
    // Fill mode (may crop or fill the box)
    if (imgRatio > printRatio) {
      finalHeight = printableHeight;
      finalWidth = printableHeight * imgRatio;
    } else {
      finalWidth = printableWidth;
      finalHeight = printableWidth / imgRatio;
    }
  }

  // Center on page
  const x = (pageWidth - finalWidth) / 2;
  const y = (pageHeight - finalHeight) / 2;

  return { x, y, width: finalWidth, height: finalHeight };
}
