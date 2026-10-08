import React from 'react';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  presetColors?: string[];
  label?: string;
}

const DEFAULT_PRESETS = [
  '#000000',
  '#ffffff',
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#06b6d4',
  '#3b82f6',
  '#6366f1',
  '#a855f7',
  '#ec4899',
  '#64748b',
];

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  onChange,
  presetColors = DEFAULT_PRESETS,
  label,
}) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-medium text-slate-400">{label}</label>}
      <div className="flex items-center gap-1.5 flex-wrap">
        {presetColors.map((color) => {
          const isSelected = value.toLowerCase() === color.toLowerCase();
          return (
            <button
              key={color}
              type="button"
              onClick={() => onChange(color)}
              className={`w-6 h-6 rounded-full border transition-transform ${
                isSelected
                  ? 'scale-110 ring-2 ring-brand-500 ring-offset-2 ring-offset-slate-900 border-white'
                  : 'hover:scale-105 border-slate-700'
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          );
        })}

        {/* Custom native color input */}
        <label
          className="relative w-6 h-6 rounded-full border border-slate-600 overflow-hidden cursor-pointer hover:scale-105 transition-transform flex items-center justify-center bg-gradient-to-tr from-rose-500 via-emerald-500 to-sky-500"
          title="Custom Color"
        >
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
          />
        </label>
      </div>
    </div>
  );
};
