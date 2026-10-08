import React, { useState } from 'react';
import { ImageItem } from '../../types';
import { ImageCard } from './ImageCard';
import { ImageDropzone } from './ImageDropzone';
import { Button } from '../ui/Button';
import { RotateCw, Trash2, Plus, Sparkles } from 'lucide-react';

interface ImageGridProps {
  images: ImageItem[];
  onRotate: (id: string) => void;
  onMirror: (id: string) => void;
  onToggleFit: (id: string) => void;
  onDelete: (id: string) => void;
  onReorder: (newImages: ImageItem[]) => void;
  onAddFiles: (files: File[]) => void;
  onRotateAll: () => void;
  onClearAll: () => void;
  onLoadSampleImages?: () => void;
}

export const ImageGrid: React.FC<ImageGridProps> = ({
  images,
  onRotate,
  onMirror,
  onToggleFit,
  onDelete,
  onReorder,
  onAddFiles,
  onRotateAll,
  onClearAll,
  onLoadSampleImages,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleMove = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length) return;
    const updated = [...images];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    onReorder(updated);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // set drag payload
    e.dataTransfer.setData('text/plain', `${index}`);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      return;
    }
    handleMove(draggedIndex, targetIndex);
    setDraggedIndex(null);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Top action header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Page Sequence ({images.length} {images.length === 1 ? 'page' : 'pages'})
          </span>
          <span className="text-xs text-slate-400 hidden sm:inline">
            — Drag cards to reorder
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onRotateAll} title="Rotate all pages 90°">
            <RotateCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Rotate All</span>
          </Button>

          {onLoadSampleImages && (
            <Button
              variant="outline"
              size="sm"
              onClick={onLoadSampleImages}
              title="Add sample images"
              className="text-amber-500 hover:text-amber-400"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Demo</span>
            </Button>
          )}

          <Button
            variant="danger"
            size="sm"
            onClick={onClearAll}
            title="Clear all images"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear All</span>
          </Button>
        </div>
      </div>

      {/* Grid of image cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <ImageCard
            key={image.id}
            image={image}
            index={index}
            totalCount={images.length}
            onRotate={onRotate}
            onMirror={onMirror}
            onToggleFit={onToggleFit}
            onDelete={onDelete}
            onMove={handleMove}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            isDragging={draggedIndex === index}
          />
        ))}
      </div>

      {/* Compact bottom dropzone to add more */}
      <ImageDropzone onFilesSelected={onAddFiles} compact />
    </div>
  );
};
