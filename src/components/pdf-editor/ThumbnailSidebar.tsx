import React, { useState } from 'react';
import { EditorPageInfo } from '../../types';
import {
  RotateCw,
  Copy,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

interface ThumbnailSidebarProps {
  pages: EditorPageInfo[];
  currentPageIndex: number;
  onSelectPage: (index: number) => void;
  onRotatePage: (index: number) => void;
  onDuplicatePage: (index: number) => void;
  onDeletePage: (index: number) => void;
  onReorderPages: (newPages: EditorPageInfo[]) => void;
  onAddBlankPage: () => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const ThumbnailSidebar: React.FC<ThumbnailSidebarProps> = ({
  pages,
  currentPageIndex,
  onSelectPage,
  onRotatePage,
  onDuplicatePage,
  onDeletePage,
  onReorderPages,
  onAddBlankPage,
  isOpen,
  onToggleOpen,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleMove = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= pages.length) return;
    const updated = [...pages];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    onReorderPages(updated);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
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

  if (!isOpen) {
    return (
      <div className="border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 flex flex-col items-center">
        <button
          type="button"
          onClick={onToggleOpen}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          title="Open Pages Drawer"
        >
          <PanelLeftOpen className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col h-[calc(100vh-8rem)] shrink-0 z-20 select-none">
      {/* Sidebar Header */}
      <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
          Pages ({pages.length})
        </span>
        <button
          type="button"
          onClick={onToggleOpen}
          className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          title="Collapse Drawer"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      {/* Pages list */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        {pages.map((page, index) => {
          const isActive = index === currentPageIndex;

          return (
            <div
              key={`${page.originalPageIndex}-${index}`}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              onClick={() => onSelectPage(index)}
              className={`group relative p-2.5 rounded-2xl border transition-all cursor-pointer ${
                isActive
                  ? 'border-brand-500 bg-brand-500/10 ring-2 ring-brand-500/30'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-950/40'
              }`}
            >
              {/* Top info badge + Reorder arrows */}
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold font-mono rounded ${
                    isActive
                      ? 'bg-brand-500 text-white'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Page {index + 1}
                </span>

                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMove(index, index - 1);
                    }}
                    disabled={index === 0}
                    className="p-0.5 rounded text-slate-400 hover:text-slate-200 disabled:opacity-20"
                    title="Move Page Up"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 rotate-90" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMove(index, index + 1);
                    }}
                    disabled={index === pages.length - 1}
                    className="p-0.5 rounded text-slate-400 hover:text-slate-200 disabled:opacity-20"
                    title="Move Page Down"
                  >
                    <ChevronRight className="w-3.5 h-3.5 rotate-90" />
                  </button>
                </div>
              </div>

              {/* Thumbnail Container */}
              <div className="relative aspect-[3/4] w-full rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 overflow-hidden flex items-center justify-center p-1 shadow-sm">
                {page.thumbnailUrl ? (
                  <img
                    src={page.thumbnailUrl}
                    alt={`Page ${index + 1}`}
                    className="max-h-full max-w-full object-contain transition-transform"
                    style={{ transform: `rotate(${page.rotation}deg)` }}
                  />
                ) : (
                  <div className="text-[10px] text-slate-400 font-mono">Blank Page</div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-1 mt-2 pt-1.5 border-t border-slate-200/60 dark:border-slate-800/60">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRotatePage(index);
                  }}
                  className="p-1 rounded flex items-center justify-center text-slate-400 hover:text-brand-500 hover:bg-brand-500/10 transition-colors"
                  title="Rotate Page 90°"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicatePage(index);
                  }}
                  className="p-1 rounded flex items-center justify-center text-slate-400 hover:text-brand-500 hover:bg-brand-500/10 transition-colors"
                  title="Duplicate Page"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeletePage(index);
                  }}
                  disabled={pages.length <= 1}
                  className="p-1 rounded flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 disabled:opacity-20 transition-colors"
                  title="Delete Page"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Blank Page Button */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={onAddBlankPage}
          className="w-full py-2 px-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-500 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-brand-500 flex items-center justify-center gap-1.5 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Blank Page</span>
        </button>
      </div>
    </aside>
  );
};
