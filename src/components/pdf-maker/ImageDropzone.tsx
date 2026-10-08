import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';

interface ImageDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  onLoadSampleImages?: () => void;
  compact?: boolean;
}

export const ImageDropzone: React.FC<ImageDropzoneProps> = ({
  onFilesSelected,
  onLoadSampleImages,
  compact = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const validFiles = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith('image/')
      );
      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const validFiles = Array.from(e.target.files).filter((file) =>
        file.type.startsWith('image/')
      );
      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
      e.target.value = ''; // Reset
    }
  };

  if (compact) {
    return (
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex items-center justify-center gap-3 p-4 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
          isDragOver
            ? 'border-brand-500 bg-brand-500/10'
            : 'border-slate-300 dark:border-slate-800 hover:border-brand-400 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/png,image/jpeg,image/webp,image/svg+xml,image/bmp"
          className="hidden"
          onChange={handleFileInput}
        />
        <UploadCloud className="w-5 h-5 text-brand-500 shrink-0" />
        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
          Drop more images here or click to browse
        </span>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative rounded-3xl border-2 border-dashed transition-all duration-300 p-8 sm:p-14 text-center flex flex-col items-center justify-center ${
        isDragOver
          ? 'border-brand-500 bg-brand-500/10 scale-[1.01] shadow-xl shadow-brand-500/10'
          : 'border-slate-300 dark:border-slate-800 hover:border-brand-400 dark:hover:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40 shadow-sm'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/webp,image/svg+xml,image/bmp"
        className="hidden"
        onChange={handleFileInput}
      />

      {/* Glow effect behind icon */}
      <div className="relative mb-6">
        <div className="absolute -inset-4 rounded-full bg-gradient-to-tr from-brand-500/20 to-sky-500/20 blur-xl"></div>
        <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-brand-600/30">
          <UploadCloud className="w-10 h-10" />
        </div>
      </div>

      <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
        Upload Images to Convert to PDF
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-8">
        Drag and drop your images here or browse from your device. Supports JPG, PNG, WebP, SVG, and
        BMP.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          variant="primary"
          size="lg"
          onClick={() => inputRef.current?.click()}
          className="shadow-lg shadow-brand-600/25"
        >
          <ImageIcon className="w-4 h-4" />
          <span>Select Images</span>
        </Button>

        {onLoadSampleImages && (
          <Button
            variant="secondary"
            size="lg"
            onClick={onLoadSampleImages}
            className="border-dashed"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Load Sample Images</span>
          </Button>
        )}
      </div>

      <div className="mt-8 flex items-center gap-6 text-xs text-slate-400 dark:text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 100% Client-Side Privacy
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span> No File Size Limits
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span> Instant Compilation
        </span>
      </div>
    </div>
  );
};
