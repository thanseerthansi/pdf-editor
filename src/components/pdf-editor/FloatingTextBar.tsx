import React from 'react';
import { TextProperties } from '../../types';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Minus,
  Plus,
  Trash2,
  Highlighter,
} from 'lucide-react';
import { ColorPicker } from '../ui/ColorPicker';

interface FloatingTextBarProps {
  textProps: TextProperties;
  onChange: (props: Partial<TextProperties>) => void;
  onDelete: () => void;
  position?: { x: number; y: number } | null;
}

const FONT_OPTIONS = [
  { label: 'Helvetica', value: 'Helvetica, Arial, sans-serif' },
  { label: 'Inter', value: "'Inter', sans-serif" },
  { label: 'Times New Roman', value: "'Times New Roman', serif" },
  { label: 'Courier New', value: "'Courier New', monospace" },
  { label: 'JetBrains Mono', value: "'JetBrains Mono', monospace" },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Arial', value: 'Arial, sans-serif' },
];

const HIGHLIGHT_COLORS = [
  { label: 'None', value: 'transparent' },
  { label: 'Yellow', value: 'rgba(254, 240, 138, 0.6)' },
  { label: 'Green', value: 'rgba(187, 247, 208, 0.6)' },
  { label: 'Pink', value: 'rgba(251, 207, 232, 0.6)' },
  { label: 'Sky', value: 'rgba(186, 230, 253, 0.6)' },
  { label: 'Orange', value: 'rgba(254, 215, 170, 0.6)' },
];

export const FloatingTextBar: React.FC<FloatingTextBarProps> = ({
  textProps,
  onChange,
  onDelete,
  position,
}) => {
  const handleSizeChange = (delta: number) => {
    const newSize = Math.max(8, Math.min(120, textProps.fontSize + delta));
    onChange({ fontSize: newSize });
  };

  return (
    <div
      className="flex items-center gap-2 p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-40 backdrop-blur-md animate-scale-in text-xs flex-wrap"
      style={
        position
          ? {
              position: 'absolute',
              left: `${Math.max(20, position.x)}px`,
              top: `${Math.max(10, position.y - 52)}px`,
            }
          : undefined
      }
    >
      {/* Font Family Selector */}
      <select
        value={textProps.fontFamily}
        onChange={(e) => onChange({ fontFamily: e.target.value })}
        className="px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/40"
      >
        {FONT_OPTIONS.map((f) => (
          <option key={f.value} value={f.value}>
            {f.label}
          </option>
        ))}
      </select>

      {/* Font Size Step Controls */}
      <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5">
        <button
          type="button"
          onClick={() => handleSizeChange(-2)}
          className="p-1 rounded text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          title="Decrease Font Size"
        >
          <Minus className="w-3 h-3" />
        </button>

        <span className="px-1.5 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 min-w-[32px] text-center">
          {textProps.fontSize}px
        </span>

        <button
          type="button"
          onClick={() => handleSizeChange(2)}
          className="p-1 rounded text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          title="Increase Font Size"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      {/* Font Styles: Bold, Italic, Underline, Strikethrough */}
      <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5">
        <button
          type="button"
          onClick={() => onChange({ isBold: !textProps.isBold })}
          className={`p-1.5 rounded transition-colors ${
            textProps.isBold
              ? 'bg-brand-500/20 text-brand-600 dark:text-brand-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => onChange({ isItalic: !textProps.isItalic })}
          className={`p-1.5 rounded transition-colors ${
            textProps.isItalic
              ? 'bg-brand-500/20 text-brand-600 dark:text-brand-400'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => onChange({ isUnderline: !textProps.isUnderline })}
          className={`p-1.5 rounded transition-colors ${
            textProps.isUnderline
              ? 'bg-brand-500/20 text-brand-600 dark:text-brand-400'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
          title="Underline (Ctrl+U)"
        >
          <Underline className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => onChange({ isLinethrough: !textProps.isLinethrough })}
          className={`p-1.5 rounded transition-colors ${
            textProps.isLinethrough
              ? 'bg-brand-500/20 text-brand-600 dark:text-brand-400'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
          title="Strikethrough"
        >
          <Strikethrough className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Text Alignment */}
      <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5">
        {(['left', 'center', 'right'] as const).map((align) => (
          <button
            key={align}
            type="button"
            onClick={() => onChange({ textAlign: align })}
            className={`p-1.5 rounded transition-colors ${
              textProps.textAlign === align
                ? 'bg-brand-500/20 text-brand-600 dark:text-brand-400'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
            title={`Align ${align}`}
          >
            {align === 'left' && <AlignLeft className="w-3.5 h-3.5" />}
            {align === 'center' && <AlignCenter className="w-3.5 h-3.5" />}
            {align === 'right' && <AlignRight className="w-3.5 h-3.5" />}
          </button>
        ))}
      </div>

      {/* Text Color Picker */}
      <div className="flex items-center gap-1.5 pl-1">
        <ColorPicker
          value={textProps.fill}
          onChange={(c) => onChange({ fill: c })}
          presetColors={[
            '#000000',
            '#ffffff',
            '#ef4444',
            '#1d4ed8',
            '#16a34a',
            '#7c3aed',
            '#ea580c',
          ]}
        />
      </div>

      {/* Text Highlight Background */}
      <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-700 pl-2">
        <Highlighter className="w-3.5 h-3.5 text-slate-400" />
        <div className="flex items-center gap-1">
          {HIGHLIGHT_COLORS.map((h) => (
            <button
              key={h.label}
              type="button"
              onClick={() => onChange({ backgroundColor: h.value })}
              className={`w-4 h-4 rounded-full border transition-transform ${
                textProps.backgroundColor === h.value
                  ? 'ring-2 ring-brand-500 scale-110 border-white'
                  : 'border-slate-400 hover:scale-105'
              }`}
              style={{
                backgroundColor: h.value === 'transparent' ? '#ffffff' : h.value,
              }}
              title={`Highlight: ${h.label}`}
            />
          ))}
        </div>
      </div>

      {/* Delete button */}
      <button
        type="button"
        onClick={onDelete}
        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors ml-1"
        title="Delete Text Box"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
