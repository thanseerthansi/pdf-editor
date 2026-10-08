import { ImageItem } from '../types';

/**
 * Loads an HTMLImageElement from a Blob or URL
 */
export function loadImageElement(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = url;
  });
}

/**
 * Reads an image file and returns an ImageItem with native dimensions and preview URL
 */
export async function processImageFile(file: File): Promise<ImageItem> {
  const previewUrl = URL.createObjectURL(file);
  const img = await loadImageElement(previewUrl);

  return {
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    file,
    name: file.name,
    size: file.size,
    previewUrl,
    width: img.naturalWidth || img.width || 800,
    height: img.naturalHeight || img.height || 600,
    rotation: 0,
    mirrored: false,
    fitMode: 'fit',
  };
}

/**
 * Renders an ImageItem to a Canvas with rotation & mirroring applied,
 * returning processed JPEG/PNG image bytes for pdf-lib embedding.
 */
export async function getTransformedImageBytes(
  item: ImageItem,
  qualityMultiplier: number = 0.92
): Promise<{ bytes: Uint8Array; format: 'jpeg' | 'png'; width: number; height: number }> {
  const img = await loadImageElement(item.previewUrl);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D context for image transform');

  const isRotated90or270 = item.rotation % 180 !== 0;
  const canvasWidth = isRotated90or270 ? img.naturalHeight : img.naturalWidth;
  const canvasHeight = isRotated90or270 ? img.naturalWidth : img.naturalHeight;

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  ctx.save();
  // Move origin to canvas center
  ctx.translate(canvasWidth / 2, canvasHeight / 2);

  // Apply rotation
  ctx.rotate((item.rotation * Math.PI) / 180);

  // Apply horizontal flip if mirrored
  if (item.mirrored) {
    ctx.scale(-1, 1);
  }

  // Draw image centered
  ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
  ctx.restore();

  // If original is PNG or SVG or transparent, use PNG, otherwise JPEG
  const isPng = item.file.type === 'image/png' || item.file.type === 'image/svg+xml';
  const mimeType = isPng ? 'image/png' : 'image/jpeg';
  const format: 'jpeg' | 'png' = isPng ? 'png' : 'jpeg';

  const dataUrl = canvas.toDataURL(mimeType, qualityMultiplier);
  const base64Data = dataUrl.split(',')[1];
  const binaryStr = atob(base64Data);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }

  return {
    bytes,
    format,
    width: canvasWidth,
    height: canvasHeight,
  };
}

/**
 * Format bytes to readable string (e.g. 1.2 MB)
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
