import React, { useRef, useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Eraser, Upload, Check, PenTool } from 'lucide-react';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplySignature: (dataUrl: string) => void;
}

export const SignatureModal: React.FC<SignatureModalProps> = ({
  isOpen,
  onClose,
  onApplySignature,
}) => {
  const [tab, setTab] = useState<'draw' | 'upload'>('draw');
  const [inkColor, setInkColor] = useState<string>('#0f172a');
  const [strokeWidth, setStrokeWidth] = useState<number>(3);
  const [hasDrawn, setHasDrawn] = useState<boolean>(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef<boolean>(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (isOpen && tab === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = inkColor;
        ctx.lineWidth = strokeWidth;
      }
    }
  }, [isOpen, tab, inkColor, strokeWidth]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    isDrawingRef.current = true;
    lastPointRef.current = { x, y };

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (ctx && lastPointRef.current) {
      ctx.strokeStyle = inkColor;
      ctx.lineWidth = strokeWidth;
      ctx.lineTo(x, y);
      ctx.stroke();
      setHasDrawn(true);
    }
    lastPointRef.current = { x, y };
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
    lastPointRef.current = null;
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    setHasDrawn(false);
  };

  const handleApply = () => {
    if (tab === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas || !hasDrawn) return;
      // Extract trimmed transparent png
      const dataUrl = canvas.toDataURL('image/png');
      onApplySignature(dataUrl);
    } else if (tab === 'upload' && uploadedUrl) {
      onApplySignature(uploadedUrl);
    }
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Digital Signature"
      subtitle="Draw your signature or upload a transparent PNG image"
      maxWidth="max-w-lg"
    >
      <div className="flex flex-col gap-5">
        {/* Tab switch */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setTab('draw')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
              tab === 'draw'
                ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Draw Signature</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('upload')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
              tab === 'upload'
                ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Image</span>
          </button>
        </div>

        {tab === 'draw' ? (
          <div className="flex flex-col gap-4">
            {/* Draw controls: Ink colors + Stroke */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500">Ink:</span>
                {[
                  { color: '#0f172a', label: 'Black' },
                  { color: '#1d4ed8', label: 'Blue' },
                  { color: '#b91c1c', label: 'Red' },
                ].map((item) => (
                  <button
                    key={item.color}
                    type="button"
                    onClick={() => setInkColor(item.color)}
                    className={`w-6 h-6 rounded-full border-2 transition-transform ${
                      inkColor === item.color
                        ? 'ring-2 ring-brand-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 scale-110'
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: item.color, borderColor: '#ffffff' }}
                    title={item.label}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500">Thickness:</span>
                {[2, 3, 5].map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setStrokeWidth(w)}
                    className={`px-2 py-0.5 text-xs rounded border transition-colors ${
                      strokeWidth === w
                        ? 'border-brand-500 bg-brand-500/10 text-brand-500 font-bold'
                        : 'border-slate-300 dark:border-slate-700 text-slate-400'
                    }`}
                  >
                    {w}px
                  </button>
                ))}
              </div>
            </div>

            {/* Drawing Canvas */}
            <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl overflow-hidden bg-white shadow-inner">
              <canvas
                ref={canvasRef}
                width={480}
                height={200}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-[200px] cursor-crosshair touch-none"
              />
              {/* Baseline guideline */}
              <div className="absolute bottom-8 left-8 right-8 border-b border-slate-200 pointer-events-none flex justify-between">
                <span className="text-[10px] text-slate-300 font-mono">Sign on the line</span>
                <span className="text-[10px] text-slate-300 font-mono">✕</span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-rose-500 transition-colors"
              >
                <Eraser className="w-3.5 h-3.5" />
                <span>Clear Canvas</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-950/40">
            {uploadedUrl ? (
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm max-h-40 flex items-center justify-center bg-checkered">
                  <img src={uploadedUrl} alt="Signature" className="max-h-32 object-contain" />
                </div>
                <label className="text-xs text-brand-500 hover:underline cursor-pointer">
                  Change image
                  <input type="file" accept="image/png,image/jpeg" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            ) : (
              <label className="flex flex-col items-center gap-3 cursor-pointer">
                <div className="p-3 rounded-xl bg-brand-500/10 text-brand-500">
                  <Upload className="w-6 h-6" />
                </div>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Select signature PNG / JPG
                </span>
                <span className="text-xs text-slate-400">Transparent PNG recommended</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          <Button variant="outline" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleApply}
            disabled={tab === 'draw' ? !hasDrawn : !uploadedUrl}
          >
            <Check className="w-4 h-4" />
            <span>Place on Page</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
};
