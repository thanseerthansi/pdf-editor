import React from 'react';
import {
  EditorTool,
  TextProperties,
  DrawingProperties,
  ShapeProperties,
} from '../../types';
import {
  MousePointer,
  Type,
  CheckCircle2,
  XCircle,
  Pen,
  Highlighter,
  Square,
  Circle,
  ArrowUpRight,
  Minus,
  Plus,
  ShieldAlert,
  FileSignature,
  Stamp,
  Trash2,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  FileUp,
} from 'lucide-react';
import { ColorPicker } from '../ui/ColorPicker';

interface EditorToolbarProps {
  activeTool: EditorTool;
  onSelectTool: (tool: EditorTool) => void;
  // Tool Properties
  textProps: TextProperties;
  onTextPropsChange: (props: Partial<TextProperties>) => void;
  drawingProps: DrawingProperties;
  onDrawingPropsChange: (props: Partial<DrawingProperties>) => void;
  shapeProps: ShapeProperties;
  onShapePropsChange: (props: Partial<ShapeProperties>) => void;
  // Modals & Action triggers
  onOpenSignatureModal: () => void;
  onOpenStampModal: () => void;
  onDeleteSelected: () => void;
  hasSelection: boolean;
  onOpenFile?: () => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  activeTool,
  onSelectTool,
  textProps,
  onTextPropsChange,
  drawingProps,
  onDrawingPropsChange,
  shapeProps,
  onShapePropsChange,
  onOpenSignatureModal,
  onOpenStampModal,
  onDeleteSelected,
  hasSelection,
  onOpenFile,
}) => {
  const tools = [
    { id: 'select', label: 'Select & Move', icon: <MousePointer className="w-4 h-4" /> },
    { id: 'text', label: 'Add Text', icon: <Type className="w-4 h-4" /> },
    {
      id: 'check',
      label: 'Tick (✓)',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
    },
    {
      id: 'cross',
      label: 'Cross (✕)',
      icon: <XCircle className="w-4 h-4 text-rose-500" />,
    },
    { id: 'pen', label: 'Pen', icon: <Pen className="w-4 h-4" /> },
    { id: 'highlighter', label: 'Highlighter', icon: <Highlighter className="w-4 h-4" /> },
    { id: 'rectangle', label: 'Rectangle', icon: <Square className="w-4 h-4" /> },
    { id: 'circle', label: 'Circle', icon: <Circle className="w-4 h-4" /> },
    { id: 'arrow', label: 'Arrow', icon: <ArrowUpRight className="w-4 h-4" /> },
    { id: 'line', label: 'Line', icon: <Minus className="w-4 h-4" /> },
    { id: 'redact', label: 'Redact & Whiteout', icon: <ShieldAlert className="w-4 h-4" /> },
  ];

  return (
    <div className="w-full flex flex-col border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm z-30 transition-all">
      {/* Primary Tool Icons */}
      <div className="flex items-center justify-between px-4 py-2 overflow-x-auto gap-2 border-b border-slate-100 dark:border-slate-800/60">
        <div className="flex items-center gap-1">
          {onOpenFile && (
            <button
              type="button"
              onClick={onOpenFile}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/30 transition-all mr-1 shrink-0"
              title="Open / Change PDF File"
            >
              <FileUp className="w-4 h-4" />
              <span className="hidden lg:inline">Open PDF</span>
            </button>
          )}

          {tools.map((tool) => (
            <button
              key={tool.id}
              type="button"
              onClick={() => onSelectTool(tool.id as EditorTool)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                activeTool === tool.id
                  ? 'bg-brand-500/15 text-brand-600 dark:text-brand-400 border border-brand-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
              }`}
              title={tool.label}
            >
              {tool.icon}
              <span className="hidden md:inline">{tool.label}</span>
            </button>
          ))}
        </div>

        {/* Special Actions (Signature, Stamp, Delete) */}
        <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-slate-800 shrink-0">
          <button
            type="button"
            onClick={onOpenSignatureModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 hover:bg-brand-100 dark:hover:bg-brand-900/50 border border-brand-300 dark:border-brand-700/60 transition-all"
            title="Add Signature"
          >
            <FileSignature className="w-4 h-4" />
            <span className="hidden sm:inline">Sign</span>
          </button>

          <button
            type="button"
            onClick={onOpenStampModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-300 dark:border-indigo-700/60 transition-all"
            title="Add Stamp"
          >
            <Stamp className="w-4 h-4" />
            <span className="hidden sm:inline">Stamp</span>
          </button>

          <button
            type="button"
            onClick={onDeleteSelected}
            disabled={!hasSelection}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors"
            title="Delete Selected Element (Del)"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sub-Property Toolbar for active tool */}
      <div className="px-4 py-2 bg-slate-50/80 dark:bg-slate-950/50 flex items-center gap-4 text-xs flex-wrap min-h-[44px]">
        {/* TEXT TOOL PROPERTIES */}
        {activeTool === 'text' && (
          <div className="flex items-center gap-3 flex-wrap">
            {/* Font Family */}
            <select
              value={textProps.fontFamily}
              onChange={(e) => onTextPropsChange({ fontFamily: e.target.value })}
              className="px-2.5 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
            >
              <option value="Helvetica, Arial, sans-serif">Helvetica (Standard)</option>
              <option value="'Inter', sans-serif">Inter</option>
              <option value="'Times New Roman', serif">Times New Roman</option>
              <option value="'Courier New', monospace">Courier</option>
              <option value="'JetBrains Mono', monospace">JetBrains Mono</option>
              <option value="Georgia, serif">Georgia</option>
              <option value="Arial, sans-serif">Arial</option>
            </select>

            {/* Font Size with - and + */}
            <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() =>
                  onTextPropsChange({ fontSize: Math.max(8, textProps.fontSize - 2) })
                }
                className="p-1 rounded text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700"
                title="Decrease Size"
              >
                <Minus className="w-3 h-3" />
              </button>

              <select
                value={textProps.fontSize}
                onChange={(e) => onTextPropsChange({ fontSize: parseInt(e.target.value, 10) })}
                className="px-1.5 py-0.5 text-xs bg-transparent text-slate-800 dark:text-slate-200 font-mono font-bold focus:outline-none cursor-pointer"
              >
                {[10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 64].map((sz) => (
                  <option key={sz} value={sz} className="dark:bg-slate-900">
                    {sz}px
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() =>
                  onTextPropsChange({ fontSize: Math.min(120, textProps.fontSize + 2) })
                }
                className="p-1 rounded text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700"
                title="Increase Size"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            {/* Bold, Italic, Underline, Strikethrough */}
            <div className="flex items-center bg-white dark:bg-slate-800 rounded-lg p-0.5 border border-slate-300 dark:border-slate-700">
              <button
                type="button"
                onClick={() => onTextPropsChange({ isBold: !textProps.isBold })}
                className={`p-1.5 rounded transition-colors ${
                  textProps.isBold
                    ? 'bg-brand-500/20 text-brand-600 dark:text-brand-400 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Bold"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onTextPropsChange({ isItalic: !textProps.isItalic })}
                className={`p-1.5 rounded transition-colors ${
                  textProps.isItalic
                    ? 'bg-brand-500/20 text-brand-600 dark:text-brand-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Italic"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onTextPropsChange({ isUnderline: !textProps.isUnderline })}
                className={`p-1.5 rounded transition-colors ${
                  textProps.isUnderline
                    ? 'bg-brand-500/20 text-brand-600 dark:text-brand-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Underline"
              >
                <Underline className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onTextPropsChange({ isLinethrough: !textProps.isLinethrough })}
                className={`p-1.5 rounded transition-colors ${
                  textProps.isLinethrough
                    ? 'bg-brand-500/20 text-brand-600 dark:text-brand-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Strikethrough"
              >
                <Strikethrough className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Alignment */}
            <div className="flex items-center bg-white dark:bg-slate-800 rounded-lg p-0.5 border border-slate-300 dark:border-slate-700">
              {(['left', 'center', 'right'] as const).map((align) => (
                <button
                  key={align}
                  type="button"
                  onClick={() => onTextPropsChange({ textAlign: align })}
                  className={`p-1.5 rounded transition-colors ${
                    textProps.textAlign === align
                      ? 'bg-brand-500/20 text-brand-500 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title={`Align ${align}`}
                >
                  {align === 'left' && <AlignLeft className="w-3.5 h-3.5" />}
                  {align === 'center' && <AlignCenter className="w-3.5 h-3.5" />}
                  {align === 'right' && <AlignRight className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>

            {/* Text Color */}
            <div className="flex items-center gap-1.5 border-l border-slate-200 dark:border-slate-700 pl-2">
              <span className="text-slate-500 text-[11px]">Color:</span>
              <ColorPicker
                value={textProps.fill}
                onChange={(c) => onTextPropsChange({ fill: c })}
                presetColors={[
                  '#000000',
                  '#ffffff',
                  '#ef4444',
                  '#1d4ed8',
                  '#16a34a',
                  '#7c3aed',
                  '#ea580c',
                  '#64748b',
                ]}
              />
            </div>
          </div>
        )}

        {/* TICK / CHECKMARK TOOL PROPERTIES */}
        {activeTool === 'check' && (
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Click on the page to stamp a Checkmark (✓)
            </span>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-[11px]">Size:</span>
              {[
                { label: 'Small', sz: 20 },
                { label: 'Medium', sz: 32 },
                { label: 'Large', sz: 48 },
              ].map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => onDrawingPropsChange({ strokeWidth: s.sz })}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all ${
                    drawingProps.strokeWidth === s.sz ||
                    (drawingProps.strokeWidth < 20 && s.sz === 20)
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                      : 'border-slate-300 dark:border-slate-700 text-slate-500'
                  }`}
                >
                  {s.label} ({s.sz}px)
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-[11px]">Color:</span>
              {[
                { color: '#16a34a', label: 'Green' },
                { color: '#0f172a', label: 'Black' },
                { color: '#2563eb', label: 'Blue' },
                { color: '#dc2626', label: 'Red' },
              ].map((c) => (
                <button
                  key={c.color}
                  type="button"
                  onClick={() => onDrawingPropsChange({ color: c.color })}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${
                    drawingProps.color === c.color
                      ? 'ring-2 ring-brand-500 scale-110 border-white'
                      : 'hover:scale-105 border-slate-700'
                  }`}
                  style={{ backgroundColor: c.color }}
                  title={c.label}
                />
              ))}
            </div>
          </div>
        )}

        {/* CROSS TOOL PROPERTIES */}
        {activeTool === 'cross' && (
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
              <XCircle className="w-4 h-4" /> Click on the page to stamp a Cross (✕)
            </span>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-[11px]">Size:</span>
              {[
                { label: 'Small', sz: 20 },
                { label: 'Medium', sz: 32 },
                { label: 'Large', sz: 48 },
              ].map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => onDrawingPropsChange({ strokeWidth: s.sz })}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all ${
                    drawingProps.strokeWidth === s.sz ||
                    (drawingProps.strokeWidth < 20 && s.sz === 20)
                      ? 'border-rose-500 bg-rose-500/20 text-rose-600 dark:text-rose-400'
                      : 'border-slate-300 dark:border-slate-700 text-slate-500'
                  }`}
                >
                  {s.label} ({s.sz}px)
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-[11px]">Color:</span>
              {[
                { color: '#dc2626', label: 'Red' },
                { color: '#0f172a', label: 'Black' },
                { color: '#16a34a', label: 'Green' },
                { color: '#2563eb', label: 'Blue' },
              ].map((c) => (
                <button
                  key={c.color}
                  type="button"
                  onClick={() => onDrawingPropsChange({ color: c.color })}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${
                    drawingProps.color === c.color
                      ? 'ring-2 ring-brand-500 scale-110 border-white'
                      : 'hover:scale-105 border-slate-700'
                  }`}
                  style={{ backgroundColor: c.color }}
                  title={c.label}
                />
              ))}
            </div>
          </div>
        )}

        {/* PEN PROPERTIES */}
        {activeTool === 'pen' && (
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-[11px]">Stroke:</span>
              {[2, 4, 8, 14, 20].map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => onDrawingPropsChange({ strokeWidth: w })}
                  className={`px-2 py-0.5 rounded border text-xs ${
                    drawingProps.strokeWidth === w
                      ? 'border-brand-500 bg-brand-500/20 text-brand-400 font-bold'
                      : 'border-slate-300 dark:border-slate-700 text-slate-400'
                  }`}
                >
                  {w}px
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-[11px]">Ink Color:</span>
              <ColorPicker
                value={drawingProps.color}
                onChange={(c) => onDrawingPropsChange({ color: c })}
              />
            </div>
          </div>
        )}

        {/* HIGHLIGHTER PROPERTIES */}
        {activeTool === 'highlighter' && (
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-[11px]">Brush Width:</span>
              {[12, 18, 26, 36].map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => onDrawingPropsChange({ strokeWidth: w })}
                  className={`px-2 py-0.5 rounded border text-xs ${
                    drawingProps.strokeWidth === w
                      ? 'border-brand-500 bg-brand-500/20 text-brand-400 font-bold'
                      : 'border-slate-300 dark:border-slate-700 text-slate-400'
                  }`}
                >
                  {w}px
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-[11px]">Highlighter:</span>
              {[
                { color: '#fef08a', label: 'Yellow' },
                { color: '#86efac', label: 'Green' },
                { color: '#7dd3fc', label: 'Blue' },
                { color: '#fbcfe8', label: 'Pink' },
                { color: '#fed7aa', label: 'Orange' },
              ].map((item) => (
                <button
                  key={item.color}
                  type="button"
                  onClick={() => onDrawingPropsChange({ highlighterColor: item.color })}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${
                    drawingProps.highlighterColor === item.color
                      ? 'ring-2 ring-brand-500 ring-offset-2 ring-offset-slate-900 scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: item.color }}
                  title={item.label}
                />
              ))}
            </div>
          </div>
        )}

        {/* REDACTION / WHITEOUT PROPERTIES */}
        {activeTool === 'redact' && (
          <div className="flex items-center gap-4">
            <span className="text-slate-500 text-[11px]">Mode:</span>
            <div className="flex items-center bg-white dark:bg-slate-800 rounded-lg p-1 border border-slate-300 dark:border-slate-700">
              <button
                type="button"
                onClick={() => onDrawingPropsChange({ redactColor: 'black' })}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all ${
                  drawingProps.redactColor === 'black'
                    ? 'bg-black text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="w-3 h-3 bg-black border border-slate-600 rounded-sm"></div>
                <span>Blackout Redaction</span>
              </button>
              <button
                type="button"
                onClick={() => onDrawingPropsChange({ redactColor: 'white' })}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all ${
                  drawingProps.redactColor === 'white'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="w-3 h-3 bg-white border border-slate-300 rounded-sm"></div>
                <span>Whiteout</span>
              </button>
            </div>
            <span className="text-[11px] text-slate-400">
              Draw rectangles to securely conceal sensitive text or numbers.
            </span>
          </div>
        )}

        {/* SHAPES (RECTANGLE, CIRCLE, ARROW, LINE) */}
        {['rectangle', 'circle', 'arrow', 'line'].includes(activeTool) && (
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-[11px]">Border Width:</span>
              {[1, 2, 4, 8].map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => onShapePropsChange({ strokeWidth: w })}
                  className={`px-2 py-0.5 rounded border text-xs ${
                    shapeProps.strokeWidth === w
                      ? 'border-brand-500 bg-brand-500/20 text-brand-400 font-bold'
                      : 'border-slate-300 dark:border-slate-700 text-slate-400'
                  }`}
                >
                  {w}px
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-[11px]">Stroke:</span>
              <ColorPicker
                value={shapeProps.stroke}
                onChange={(c) => onShapePropsChange({ stroke: c })}
              />
            </div>

            {['rectangle', 'circle'].includes(activeTool) && (
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-[11px]">Fill:</span>
                <ColorPicker
                  value={shapeProps.fill === 'transparent' ? '#ffffff00' : shapeProps.fill}
                  onChange={(c) => onShapePropsChange({ fill: c })}
                />
                <button
                  type="button"
                  onClick={() => onShapePropsChange({ fill: 'transparent' })}
                  className={`px-2 py-1 rounded border text-[10px] ${
                    shapeProps.fill === 'transparent'
                      ? 'border-brand-500 text-brand-500 bg-brand-500/10 font-bold'
                      : 'border-slate-300 dark:border-slate-700 text-slate-400'
                  }`}
                >
                  No Fill
                </button>
              </div>
            )}
          </div>
        )}

        {/* SELECT TOOL HINT */}
        {activeTool === 'select' && (
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span>💡 Click any text, signature, tick, or shape to move, resize, rotate, or edit it.</span>
          </div>
        )}
      </div>
    </div>
  );
};
