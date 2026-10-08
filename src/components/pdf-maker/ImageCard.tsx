import React from 'react';
import { ImageItem } from '../../types';
import { formatBytes } from '../../lib/image-utils';
import {
  RotateCw,
  FlipHorizontal,
  Maximize,
  Minimize,
  Trash2,
  ChevronLeft,
  ChevronRight,
  GripVertical,
} from 'lucide-react';

interface ImageCardProps {
  image: ImageItem;
  index: number;
  totalCount: number;
  onRotate: (id: string) => void;
  onMirror: (id: string) => void;
  onToggleFit: (id: string) => void;
  onDelete: (id: string) => void;
  onMove: (fromIndex: number, toIndex: number) => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  isDragging?: boolean;
}

export const ImageCard: React.FC<ImageCardProps> = ({
  image,
  index,
  totalCount,
  onRotate,
  onMirror,
  onToggleFit,
  onDelete,
  onMove,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging = false,
}) => {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      className={`group relative bg-white dark:bg-slate-900 border rounded-2xl p-3.5 transition-all duration-200 flex flex-col shadow-sm hover:shadow-xl hover:shadow-brand-500/5 ${
        isDragging
          ? 'opacity-40 border-brand-500 scale-95'
          : 'border-slate-200 dark:border-slate-800 hover:border-brand-500/60'
      }`}
    >
      {/* Top Header: Badge + Drag Grip + Index */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5">
          <span className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-slate-200 rounded">
            <GripVertical className="w-3.5 h-3.5" />
          </span>
          <span className="px-2 py-0.5 text-xs font-bold font-mono bg-brand-500/10 text-brand-500 dark:text-brand-400 border border-brand-500/20 rounded-md">
            Page {index + 1}
          </span>
        </div>

        {/* Move Left / Right Quick Buttons */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onMove(index, index - 1)}
            disabled={index === 0}
            className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 disabled:opacity-20 transition-colors"
            title="Move Left"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onMove(index, index + 1)}
            disabled={index === totalCount - 1}
            className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 disabled:opacity-20 transition-colors"
            title="Move Right"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Image Preview Container */}
      <div className="relative aspect-[3/4] w-full rounded-xl bg-slate-100 dark:bg-slate-950/80 border border-slate-200/60 dark:border-slate-800/60 overflow-hidden flex items-center justify-center bg-checkered p-2 mb-3">
        <img
          src={image.previewUrl}
          alt={image.name}
          className="max-h-full max-w-full object-contain transition-transform duration-300 rounded shadow-sm"
          style={{
            transform: `rotate(${image.rotation}deg) scaleX(${image.mirrored ? -1 : 1})`,
          }}
        />

        {/* Rotation / Mirror indicator tag */}
        {(image.rotation > 0 || image.mirrored) && (
          <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-slate-900/80 backdrop-blur-sm text-[10px] font-mono text-slate-300 rounded border border-slate-700">
            {image.rotation > 0 && `${image.rotation}°`}
            {image.mirrored && ' ⇄'}
          </div>
        )}
      </div>

      {/* Info: Filename & Dimensions */}
      <div className="mb-3 px-0.5">
        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate" title={image.name}>
          {image.name}
        </p>
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
          <span>
            {image.width} × {image.height} px
          </span>
          <span>{formatBytes(image.size)}</span>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="grid grid-cols-4 gap-1 pt-2 border-t border-slate-100 dark:border-slate-800/80">
        <button
          type="button"
          onClick={() => onRotate(image.id)}
          className="p-1.5 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-brand-500 transition-colors"
          title="Rotate 90° Clockwise"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => onMirror(image.id)}
          className={`p-1.5 rounded-lg flex items-center justify-center transition-colors ${
            image.mirrored
              ? 'bg-brand-500/20 text-brand-400'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-brand-500'
          }`}
          title="Flip Horizontal (Mirror)"
        >
          <FlipHorizontal className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => onToggleFit(image.id)}
          className={`p-1.5 rounded-lg flex items-center justify-center transition-colors ${
            image.fitMode === 'fill'
              ? 'bg-brand-500/20 text-brand-400'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-brand-500'
          }`}
          title={image.fitMode === 'fit' ? 'Mode: Fit with margins' : 'Mode: Fill page'}
        >
          {image.fitMode === 'fit' ? (
            <Minimize className="w-3.5 h-3.5" />
          ) : (
            <Maximize className="w-3.5 h-3.5" />
          )}
        </button>

        <button
          type="button"
          onClick={() => onDelete(image.id)}
          className="p-1.5 rounded-lg flex items-center justify-center text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
          title="Delete Page"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
