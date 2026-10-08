import React from 'react';
import { AppMode } from '../../types';
import { Button } from '../ui/Button';
import { ThemeToggle } from './ThemeToggle';
import {
  FileImage,
  FileEdit,
  Download,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Undo2,
  Redo2,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
  // Zoom & View
  zoom?: number;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onZoomFit?: () => void;
  // History
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  // Export Action
  onExport: () => void;
  isExporting: boolean;
  exportDisabled: boolean;
  exportLabel?: string;
  onLoadSample?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  mode,
  onModeChange,
  zoom = 1.0,
  onZoomIn,
  onZoomOut,
  onZoomFit,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  onExport,
  isExporting,
  exportDisabled,
  exportLabel,
  onLoadSample,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-sky-500 p-0.5 shadow-lg shadow-brand-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-sky-400 text-lg tracking-tight">
                DS
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white">
                DocuStudio
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-brand-500/10 text-brand-400 border border-brand-500/20 rounded-full">
                Client-Side
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              PDF Maker & Annotation Editor
            </p>
          </div>
        </div>

        {/* Center: Mode Switcher Tabs */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-900/90 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner">
          <button
            onClick={() => onModeChange('maker')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
              mode === 'maker'
                ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700/60'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <FileImage className="w-4 h-4" />
            <span>Images to PDF</span>
          </button>
          <button
            onClick={() => onModeChange('editor')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
              mode === 'editor'
                ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700/60'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <FileEdit className="w-4 h-4" />
            <span>PDF Editor</span>
          </button>
        </div>

        {/* Right Section: Tool Controls + Export */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Editor Zoom Controls */}
          {mode === 'editor' && (
            <div className="hidden lg:flex items-center bg-slate-100 dark:bg-slate-900/80 rounded-lg p-0.5 border border-slate-200 dark:border-slate-800">
              <button
                onClick={onZoomOut}
                className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 text-xs font-mono font-medium text-slate-600 dark:text-slate-300 min-w-[45px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={onZoomIn}
                className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onZoomFit}
                className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors border-l border-slate-200 dark:border-slate-800 ml-0.5"
                title="Fit to Screen"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Undo / Redo */}
          {mode === 'editor' && (
            <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-900/80 rounded-lg p-0.5 border border-slate-200 dark:border-slate-800">
              <button
                onClick={onUndo}
                disabled={!canUndo}
                className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 disabled:opacity-40 disabled:hover:bg-transparent dark:hover:text-slate-100 transition-colors"
                title="Undo (Ctrl+Z)"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                onClick={onRedo}
                disabled={!canRedo}
                className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 disabled:opacity-40 disabled:hover:bg-transparent dark:hover:text-slate-100 transition-colors"
                title="Redo (Ctrl+Y)"
              >
                <Redo2 className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Sample Loader */}
          {onLoadSample && (
            <Button
              variant="outline"
              size="sm"
              onClick={onLoadSample}
              className="hidden xl:inline-flex text-xs"
              title="Load sample content to test"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Load Demo</span>
            </Button>
          )}

          <ThemeToggle />

          {/* Primary Export Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={onExport}
            isLoading={isExporting}
            disabled={exportDisabled || isExporting}
            className="shadow-md"
          >
            <Download className="w-4 h-4" />
            <span className="font-semibold">{exportLabel || 'Export PDF'}</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
