import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Check, Stamp as StampIcon, Sparkles } from 'lucide-react';

interface StampSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStamp: (stampDataUrl: string) => void;
}

const PRESET_STAMPS = [
  { text: 'APPROVED', color: '#16a34a', borderStyle: 'solid' },
  { text: 'CONFIDENTIAL', color: '#dc2626', borderStyle: 'solid' },
  { text: 'DRAFT', color: '#d97706', borderStyle: 'dashed' },
  { text: 'SIGN HERE', color: '#2563eb', borderStyle: 'solid' },
  { text: 'COMPLETED', color: '#7c3aed', borderStyle: 'solid' },
  { text: 'VOID', color: '#e11d48', borderStyle: 'solid' },
  { text: 'PAID', color: '#059669', borderStyle: 'solid' },
  { text: 'FINAL', color: '#0284c7', borderStyle: 'solid' },
];

export const StampSelectorModal: React.FC<StampSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectStamp,
}) => {
  const [customText, setCustomText] = useState('');
  const [customColor, setCustomColor] = useState('#2563eb');

  const createStampDataUrl = (
    text: string,
    color: string,
    borderStyle: string = 'solid'
  ): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 140;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Rounded rectangle border
    const pad = 12;
    const w = canvas.width - pad * 2;
    const h = canvas.height - pad * 2;
    const r = 16;

    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 8;
    if (borderStyle === 'dashed') {
      ctx.setLineDash([14, 8]);
    }

    ctx.beginPath();
    ctx.moveTo(pad + r, pad);
    ctx.lineTo(pad + w - r, pad);
    ctx.quadraticCurveTo(pad + w, pad, pad + w, pad + r);
    ctx.lineTo(pad + w, pad + h - r);
    ctx.quadraticCurveTo(pad + w, pad + h, pad + w - r, pad + h);
    ctx.lineTo(pad + r, pad + h);
    ctx.quadraticCurveTo(pad, pad + h, pad, pad + h - r);
    ctx.lineTo(pad, pad + r);
    ctx.quadraticCurveTo(pad, pad, pad + r, pad);
    ctx.closePath();
    ctx.stroke();

    // Inner subtle background fill
    ctx.fillStyle = `${color}15`;
    ctx.fill();

    // Stamp text
    ctx.fillStyle = color;
    ctx.font = 'bold 44px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text.toUpperCase(), canvas.width / 2, canvas.height / 2);

    ctx.restore();

    return canvas.toDataURL('image/png');
  };

  const handlePickPreset = (preset: (typeof PRESET_STAMPS)[0]) => {
    const url = createStampDataUrl(preset.text, preset.color, preset.borderStyle);
    onSelectStamp(url);
    onClose();
  };

  const handleApplyCustom = () => {
    if (!customText.trim()) return;
    const url = createStampDataUrl(customText.trim(), customColor, 'solid');
    onSelectStamp(url);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Insert Document Stamp"
      subtitle="Select a preset stamp or create your own custom watermark"
      maxWidth="max-w-lg"
    >
      <div className="flex flex-col gap-6">
        {/* Presets Grid */}
        <div className="grid grid-cols-2 gap-3">
          {PRESET_STAMPS.map((stamp) => (
            <button
              key={stamp.text}
              type="button"
              onClick={() => handlePickPreset(stamp)}
              className="p-3.5 rounded-xl border-2 hover:scale-[1.02] transition-all duration-200 flex items-center justify-center font-bold tracking-wider text-sm shadow-sm"
              style={{
                borderColor: stamp.color,
                color: stamp.color,
                backgroundColor: `${stamp.color}10`,
                borderStyle: stamp.borderStyle,
              }}
            >
              <StampIcon className="w-4 h-4 mr-2 opacity-70" />
              <span>{stamp.text}</span>
            </button>
          ))}
        </div>

        {/* Custom Stamp Section */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            <span>Create Custom Stamp</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="e.g. URGENT REVIEW"
              maxLength={24}
              className="flex-1 px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl uppercase font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            />
            <input
              type="color"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              className="w-9 h-9 rounded-xl border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5"
            />
            <Button
              variant="primary"
              size="sm"
              onClick={handleApplyCustom}
              disabled={!customText.trim()}
            >
              <Check className="w-3.5 h-3.5" />
              <span>Insert</span>
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
