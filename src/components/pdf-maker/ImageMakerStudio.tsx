import React, { useState } from 'react';
import { DocumentSettings, ImageItem, ToastMessage } from '../../types';
import { ImageDropzone } from './ImageDropzone';
import { ImageGrid } from './ImageGrid';
import { LayoutSettingsPanel } from './LayoutSettingsPanel';
import { processImageFile } from '../../lib/image-utils';
import { createPdfFromImages, downloadPdfBlob } from '../../lib/pdf-engine';
import confetti from 'canvas-confetti';

interface ImageMakerStudioProps {
  onAddToast: (toast: Omit<ToastMessage, 'id'>) => void;
  isExporting: boolean;
  setIsExporting: (v: boolean) => void;
  registerExport?: (fn: () => void) => void;
}

export const ImageMakerStudio: React.FC<ImageMakerStudioProps> = ({
  onAddToast,
  isExporting,
  setIsExporting,
  registerExport,
}) => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [settings, setSettings] = useState<DocumentSettings>({
    pageSize: 'a4',
    orientation: 'portrait',
    margins: 'none',
    quality: 'high',
    customTitle: 'DocuStudio_Document',
  });

  // Handle uploaded files
  const handleAddFiles = async (files: File[]) => {
    try {
      const newItems: ImageItem[] = [];
      for (const file of files) {
        const item = await processImageFile(file);
        newItems.push(item);
      }
      setImages((prev) => [...prev, ...newItems]);
      onAddToast({
        type: 'success',
        title: `Added ${files.length} ${files.length === 1 ? 'image' : 'images'}`,
        description: 'You can now arrange pages, adjust margins, and export to PDF.',
      });
    } catch (err: any) {
      onAddToast({
        type: 'error',
        title: 'Error reading images',
        description: err.message || 'Failed to process selected images.',
      });
    }
  };

  // Card actions
  const handleRotate = (id: string) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, rotation: (img.rotation + 90) % 360 } : img))
    );
  };

  const handleMirror = (id: string) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, mirrored: !img.mirrored } : img))
    );
  };

  const handleToggleFit = (id: string) => {
    setImages((prev) =>
      prev.map((img) =>
        img.id === id ? { ...img, fitMode: img.fitMode === 'fit' ? 'fill' : 'fit' } : img
      )
    );
  };

  const handleDelete = (id: string) => {
    setImages((prev) => {
      const filtered = prev.filter((img) => img.id !== id);
      const target = prev.find((img) => img.id === id);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return filtered;
    });
  };

  const handleRotateAll = () => {
    setImages((prev) =>
      prev.map((img) => ({
        ...img,
        rotation: (img.rotation + 90) % 360,
      }))
    );
  };

  const handleClearAll = () => {
    images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    setImages([]);
    onAddToast({
      type: 'info',
      title: 'Cleared all pages',
    });
  };

  // Generate Sample Demo Images
  const handleLoadSampleImages = async () => {
    const demoSvgs = [
      {
        name: 'Design_Proposal_Cover.svg',
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1600" viewBox="0 0 1200 1600">
          <defs>
            <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#4f46e5" />
              <stop offset="100%" stop-color="#06b6d4" />
            </linearGradient>
          </defs>
          <rect width="1200" height="1600" fill="#0f172a" />
          <circle cx="1000" cy="300" r="400" fill="url(#g1)" opacity="0.3" filter="blur(60px)"/>
          <rect x="100" y="120" width="1000" height="1360" rx="30" fill="#1e293b" stroke="#334155" stroke-width="4"/>
          <text x="180" y="320" fill="#818cf8" font-family="sans-serif" font-size="28" font-weight="bold" letter-spacing="4">DOCUSTUDIO PROJECT REPORT</text>
          <text x="180" y="440" fill="#ffffff" font-family="sans-serif" font-size="64" font-weight="900">Modern Client-Side</text>
          <text x="180" y="520" fill="#38bdf8" font-family="sans-serif" font-size="64" font-weight="900">PDF Engine</text>
          <text x="180" y="620" fill="#94a3b8" font-family="sans-serif" font-size="26" max-width="800">High-performance zero-backend document generator and interactive vector editor.</text>
          <line x1="180" y1="700" x2="1020" y2="700" stroke="#334155" stroke-width="3" />
          <rect x="180" y="760" width="260" height="160" rx="16" fill="#0f172a" stroke="#475569" stroke-width="2"/>
          <text x="220" y="830" fill="#a5b4fc" font-family="sans-serif" font-size="20">Module</text>
          <text x="220" y="880" fill="#ffffff" font-family="sans-serif" font-size="32" font-weight="bold">Images to PDF</text>
          <rect x="480" y="760" width="260" height="160" rx="16" fill="#0f172a" stroke="#475569" stroke-width="2"/>
          <text x="520" y="830" fill="#a5b4fc" font-family="sans-serif" font-size="20">Module</text>
          <text x="520" y="880" fill="#ffffff" font-family="sans-serif" font-size="32" font-weight="bold">PDF Editor</text>
          <text x="180" y="1380" fill="#64748b" font-family="sans-serif" font-size="20">Generated with DocuStudio • Confidential</text>
        </svg>`,
      },
      {
        name: 'Analytics_Chart_Page.svg',
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1600" viewBox="0 0 1200 1600">
          <rect width="1200" height="1600" fill="#ffffff" />
          <rect x="80" y="80" width="1040" height="1440" rx="20" fill="#f8fafc" stroke="#e2e8f0" stroke-width="3"/>
          <text x="140" y="180" fill="#0f172a" font-family="sans-serif" font-size="44" font-weight="bold">Performance &amp; Efficiency</text>
          <text x="140" y="230" fill="#64748b" font-family="sans-serif" font-size="22">Monthly metric comparison across client processing benchmarks</text>
          <rect x="140" y="300" width="920" height="420" rx="16" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
          <path d="M 200 620 Q 350 480, 500 530 T 800 380 T 1000 340" fill="none" stroke="#6366f1" stroke-width="6" />
          <circle cx="200" cy="620" r="8" fill="#4338ca"/>
          <circle cx="500" cy="530" r="8" fill="#4338ca"/>
          <circle cx="800" cy="380" r="8" fill="#4338ca"/>
          <circle cx="1000" cy="340" r="8" fill="#4338ca"/>
          <text x="140" y="820" fill="#0f172a" font-family="sans-serif" font-size="32" font-weight="bold">Key Highlights</text>
          <rect x="140" y="860" width="440" height="240" rx="12" fill="#eef2ff" stroke="#c7d2fe" stroke-width="2"/>
          <text x="170" y="920" fill="#4338ca" font-family="sans-serif" font-size="22" font-weight="bold">Zero Server Latency</text>
          <text x="170" y="970" fill="#475569" font-family="sans-serif" font-size="18">All transformations run locally</text>
          <text x="170" y="1000" fill="#475569" font-family="sans-serif" font-size="18">in WebAssembly &amp; Web Workers.</text>
          <rect x="620" y="860" width="440" height="240" rx="12" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="2"/>
          <text x="650" y="920" fill="#15803d" font-family="sans-serif" font-size="22" font-weight="bold">Enterprise Security</text>
          <text x="650" y="970" fill="#475569" font-family="sans-serif" font-size="18">Files never touch external servers,</text>
          <text x="650" y="1000" fill="#475569" font-family="sans-serif" font-size="18">guaranteeing full data privacy.</text>
        </svg>`,
      },
    ];

    const files: File[] = [];
    for (const demo of demoSvgs) {
      const blob = new Blob([demo.svg], { type: 'image/svg+xml' });
      const file = new File([blob], demo.name, { type: 'image/svg+xml' });
      files.push(file);
    }

    await handleAddFiles(files);
  };

  // Compile and export PDF
  const handleGeneratePdf = async () => {
    if (images.length === 0) {
      onAddToast({
        type: 'warning',
        title: 'No Images Uploaded',
        description: 'Please upload or load sample images before exporting to PDF.',
      });
      return;
    }
    setIsExporting(true);
    try {
      const pdfBytes = await createPdfFromImages(images, settings);
      downloadPdfBlob(pdfBytes, `${settings.customTitle || 'DocuStudio_Document'}.pdf`);

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      onAddToast({
        type: 'success',
        title: 'PDF Exported Successfully!',
        description: `Downloaded ${images.length} pages as high-quality PDF to your computer.`,
      });
    } catch (err: any) {
      console.error(err);
      onAddToast({
        type: 'error',
        title: 'Failed to generate PDF',
        description: err.message || 'An error occurred during compilation.',
      });
    } finally {
      setIsExporting(false);
    }
  };

  React.useEffect(() => {
    if (registerExport) {
      registerExport(handleGeneratePdf);
    }
  }, [registerExport, images, settings]);

  return (
    <div className="max-w-[1700px] mx-auto px-4 sm:px-6 py-8">
      {images.length === 0 ? (
        <div className="max-w-3xl mx-auto my-6 sm:my-12 animate-fade-in">
          <ImageDropzone
            onFilesSelected={handleAddFiles}
            onLoadSampleImages={handleLoadSampleImages}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
          {/* Main Grid Organizer */}
          <div className="lg:col-span-8 xl:col-span-8 flex flex-col gap-6">
            <ImageGrid
              images={images}
              onRotate={handleRotate}
              onMirror={handleMirror}
              onToggleFit={handleToggleFit}
              onDelete={handleDelete}
              onReorder={setImages}
              onAddFiles={handleAddFiles}
              onRotateAll={handleRotateAll}
              onClearAll={handleClearAll}
              onLoadSampleImages={handleLoadSampleImages}
            />
          </div>

          {/* Right Layout & Export Settings Panel */}
          <div className="lg:col-span-4 xl:col-span-4 sticky top-24">
            <LayoutSettingsPanel
              settings={settings}
              onChange={setSettings}
              images={images}
              onGeneratePdf={handleGeneratePdf}
              isGenerating={isExporting}
            />
          </div>
        </div>
      )}
    </div>
  );
};
