import React from 'react';
import { DocumentSettings, ImageItem } from '../../types';
import { Button } from '../ui/Button';
import { formatBytes } from '../../lib/image-utils';
import {
  FileText,
  Sliders,
  Maximize2,
  FileCheck,
  Zap,
  Download,
  Info,
} from 'lucide-react';

interface LayoutSettingsPanelProps {
  settings: DocumentSettings;
  onChange: (newSettings: DocumentSettings) => void;
  images: ImageItem[];
  onGeneratePdf: () => void;
  isGenerating: boolean;
}

export const LayoutSettingsPanel: React.FC<LayoutSettingsPanelProps> = ({
  settings,
  onChange,
  images,
  onGeneratePdf,
  isGenerating,
}) => {
  const totalImageSize = images.reduce((sum, img) => sum + img.size, 0);

  const update = (partial: Partial<DocumentSettings>) => {
    onChange({ ...settings, ...partial });
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-lg shadow-slate-900/5">
      {/* Panel Header */}
      <div className="flex items-center gap-2.5 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="p-2 rounded-xl bg-brand-500/10 text-brand-500">
          <Sliders className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            PDF Layout & Output
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Customize page sizing, margins & compression
          </p>
        </div>
      </div>

      {/* Document Name */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          PDF File Name
        </label>
        <div className="relative">
          <input
            type="text"
            value={settings.customTitle}
            onChange={(e) => update({ customTitle: e.target.value })}
            placeholder="My_Converted_Document"
            className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/50 text-slate-900 dark:text-slate-100 font-medium"
          />
          <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-mono">.pdf</span>
        </div>
      </div>

      {/* Page Size Preset */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
          <span>Page Size</span>
          <span className="text-[11px] font-normal text-slate-400">Standard formats</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'a4', label: 'A4', desc: '595 × 842 pt' },
            { id: 'letter', label: 'US Letter', desc: '612 × 792 pt' },
            { id: 'legal', label: 'US Legal', desc: '612 × 1008 pt' },
            { id: 'match', label: 'Match Image', desc: 'Native Aspect' },
          ].map((size) => (
            <button
              key={size.id}
              type="button"
              onClick={() => update({ pageSize: size.id as any })}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                settings.pageSize === size.id
                  ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-300 ring-1 ring-brand-500/40'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-950/40 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="text-xs font-bold">{size.label}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{size.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Page Orientation */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Orientation
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'portrait', label: 'Portrait' },
            { id: 'landscape', label: 'Landscape' },
            { id: 'auto', label: 'Auto Detect' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => update({ orientation: item.id as any })}
              className={`py-2 px-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                settings.orientation === item.id
                  ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-300 ring-1 ring-brand-500/40'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-950/40 text-slate-700 dark:text-slate-300'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Page Margins */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Page Margins
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'none', label: 'None', desc: '0 pt' },
            { id: 'compact', label: 'Compact', desc: '18 pt' },
            { id: 'normal', label: 'Normal', desc: '36 pt' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => update({ margins: item.id as any })}
              className={`py-2 px-2.5 rounded-xl border text-center transition-all ${
                settings.margins === item.id
                  ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-300 ring-1 ring-brand-500/40'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-950/40 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="text-xs font-bold">{item.label}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">{item.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Image Compression / Quality */}
      <div className="flex flex-col gap-2.5">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
          <span>Quality & Compression</span>
          <span className="text-[11px] font-mono text-brand-500 dark:text-brand-400 capitalize">
            {settings.quality} Quality
          </span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'high', label: 'High (95%)', desc: 'Best clarity' },
            { id: 'medium', label: 'Medium (80%)', desc: 'Balanced' },
            { id: 'web', label: 'Web (60%)', desc: 'Small size' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => update({ quality: item.id as any })}
              className={`py-2 px-1.5 rounded-xl border text-center transition-all ${
                settings.quality === item.id
                  ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-300 ring-1 ring-brand-500/40'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-950/40 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="text-xs font-bold">{item.label}</div>
              <div className="text-[9px] text-slate-500 dark:text-slate-400">{item.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Document Summary Card */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">Total Pages:</span>
          <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">
            {images.length} {images.length === 1 ? 'page' : 'pages'}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">Total Input Images:</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
            {formatBytes(totalImageSize)}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">Engine:</span>
          <span className="font-semibold text-brand-500 dark:text-brand-400 flex items-center gap-1">
            <Zap className="w-3 h-3 inline" /> pdf-lib v1.17
          </span>
        </div>
      </div>

      {/* Convert & Export Button */}
      <Button
        variant="primary"
        size="lg"
        onClick={onGeneratePdf}
        isLoading={isGenerating}
        disabled={images.length === 0 || isGenerating}
        className="w-full py-3.5 shadow-xl shadow-brand-600/20 text-sm font-bold"
      >
        <Download className="w-4 h-4" />
        <span>Generate & Download PDF</span>
      </Button>
    </div>
  );
};
