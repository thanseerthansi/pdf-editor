import React, { useEffect, useRef, useState, useCallback } from 'react';
import { fabric } from 'fabric';
import * as pdfjsLib from 'pdfjs-dist';
import {
  DrawingProperties,
  EditorPageInfo,
  EditorTool,
  ShapeProperties,
  TextProperties,
} from '../../types';
import { renderPdfPageToCanvas } from '../../lib/pdf-loader';
import { FloatingTextBar } from './FloatingTextBar';

interface CanvasWorkspaceProps {
  pdfDoc: pdfjsLib.PDFDocumentProxy | null;
  currentPage: EditorPageInfo | null;
  zoom: number;
  activeTool: EditorTool;
  onSelectTool?: (tool: EditorTool) => void;
  textProps: TextProperties;
  onTextPropsChange?: (props: Partial<TextProperties>) => void;
  drawingProps: DrawingProperties;
  shapeProps: ShapeProperties;
  onSelectionChange: (hasSelection: boolean) => void;
  onSavePageAnnotations: (pageIndex: number, json: any, dataUrl: string) => void;
  // History
  onHistoryChange: (canUndo: boolean, canRedo: boolean) => void;
  undoTrigger: number;
  redoTrigger: number;
  deleteTrigger: number;
  insertImageTrigger: { url: string; timestamp: number } | null;
}

export const CanvasWorkspace: React.FC<CanvasWorkspaceProps> = ({
  pdfDoc,
  currentPage,
  zoom,
  activeTool,
  onSelectTool,
  textProps,
  onTextPropsChange,
  drawingProps,
  shapeProps,
  onSelectionChange,
  onSavePageAnnotations,
  onHistoryChange,
  undoTrigger,
  redoTrigger,
  deleteTrigger,
  insertImageTrigger,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasElementRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);

  // Active selected text target for floating bar
  const [selectedTextPos, setSelectedTextPos] = useState<{ x: number; y: number } | null>(null);
  const [isTextSelected, setIsTextSelected] = useState<boolean>(false);

  // Undo/Redo stacks
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const isHistoryProcessing = useRef<boolean>(false);

  // Drawing state
  const isMouseDownRef = useRef<boolean>(false);
  const startPointRef = useRef<{ x: number; y: number } | null>(null);
  const activeShapeRef = useRef<fabric.Object | null>(null);

  // Save state helper for undo/redo
  const pushHistory = useCallback(() => {
    if (!fabricCanvasRef.current || isHistoryProcessing.current) return;
    const json = JSON.stringify(fabricCanvasRef.current.toJSON());
    const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
    newHistory.push(json);
    historyRef.current = newHistory;
    historyIndexRef.current = newHistory.length - 1;
    onHistoryChange(historyIndexRef.current > 0, false);
  }, [onHistoryChange]);

  // Sync canvas annotations to parent
  const syncToParent = useCallback(() => {
    if (!fabricCanvasRef.current || !currentPage) return;
    const json = fabricCanvasRef.current.toJSON();
    // Export transparent high-res overlay
    const overlayUrl = fabricCanvasRef.current.toDataURL({
      format: 'png',
      multiplier: 2,
    });
    onSavePageAnnotations(currentPage.pageIndex, json, overlayUrl);
  }, [currentPage, onSavePageAnnotations]);

  // Initialize and Render PDF + Fabric Canvas
  useEffect(() => {
    if (!pdfDoc || !currentPage || !pdfCanvasRef.current || !fabricCanvasElementRef.current) return;

    let isCancelled = false;

    const render = async () => {
      try {
        const { viewportWidth, viewportHeight } = await renderPdfPageToCanvas(
          pdfDoc,
          currentPage.originalPageIndex + 1,
          pdfCanvasRef.current!,
          zoom,
          currentPage.rotation
        );

        if (isCancelled) return;

        // Dispose previous fabric instance
        if (fabricCanvasRef.current) {
          fabricCanvasRef.current.dispose();
          fabricCanvasRef.current = null;
        }

        // Initialize Fabric.js overlay
        const fabricCanvas = new fabric.Canvas(fabricCanvasElementRef.current, {
          width: viewportWidth,
          height: viewportHeight,
          selection: true,
          preserveObjectStacking: true,
        });
        fabricCanvasRef.current = fabricCanvas;

        // Restore saved page annotations if present
        if (currentPage.fabricJson && currentPage.fabricJson.objects?.length > 0) {
          fabricCanvas.loadFromJSON(currentPage.fabricJson, () => {
            fabricCanvas.renderAll();
            historyRef.current = [JSON.stringify(fabricCanvas.toJSON())];
            historyIndexRef.current = 0;
            onHistoryChange(false, false);
          });
        } else {
          historyRef.current = [JSON.stringify(fabricCanvas.toJSON())];
          historyIndexRef.current = 0;
          onHistoryChange(false, false);
        }

        // Setup Selection Events
        const updateTextSelection = () => {
          const active = fabricCanvas.getActiveObject();
          if (active && (active instanceof fabric.Textbox || active instanceof fabric.IText)) {
            setIsTextSelected(true);
            const bound = active.getBoundingRect();
            setSelectedTextPos({ x: bound.left, y: bound.top });

            // Sync properties to toolbar
            if (onTextPropsChange) {
              onTextPropsChange({
                fontFamily: (active.fontFamily as string) || 'Helvetica, Arial, sans-serif',
                fontSize: active.fontSize || 20,
                fill: (active.fill as string) || '#0f172a',
                isBold: active.fontWeight === 'bold' || active.fontWeight === 700,
                isItalic: active.fontStyle === 'italic',
                isUnderline: Boolean(active.underline),
                isLinethrough: Boolean(active.linethrough),
                textAlign: (active.textAlign as any) || 'left',
                backgroundColor: (active.textBackgroundColor as string) || 'transparent',
              });
            }
          } else {
            setIsTextSelected(false);
            setSelectedTextPos(null);
          }
        };

        fabricCanvas.on('selection:created', (e) => {
          onSelectionChange(true);
          updateTextSelection();
        });
        fabricCanvas.on('selection:updated', (e) => {
          onSelectionChange(true);
          updateTextSelection();
        });
        fabricCanvas.on('selection:cleared', () => {
          onSelectionChange(false);
          setIsTextSelected(false);
          setSelectedTextPos(null);
        });

        // Setup Modification Events
        fabricCanvas.on('object:modified', () => {
          pushHistory();
          syncToParent();
          updateTextSelection();
        });
        fabricCanvas.on('object:moving', () => {
          updateTextSelection();
        });
        fabricCanvas.on('object:scaling', () => {
          updateTextSelection();
        });
        fabricCanvas.on('object:added', (e) => {
          if (!isHistoryProcessing.current && e.target) {
            syncToParent();
          }
        });
        fabricCanvas.on('object:removed', () => {
          if (!isHistoryProcessing.current) {
            syncToParent();
          }
        });
      } catch (err) {
        console.error('Canvas render error:', err);
      }
    };

    render();

    return () => {
      isCancelled = true;
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
  }, [pdfDoc, currentPage?.pageIndex, currentPage?.rotation, zoom]);

  // Sync text property changes to selected text object on canvas
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active && (active instanceof fabric.Textbox || active instanceof fabric.IText)) {
      active.set({
        fontFamily: textProps.fontFamily,
        fontSize: textProps.fontSize,
        fill: textProps.fill,
        fontWeight: textProps.isBold ? 'bold' : 'normal',
        fontStyle: textProps.isItalic ? 'italic' : 'normal',
        underline: Boolean(textProps.isUnderline),
        linethrough: Boolean(textProps.isLinethrough),
        textAlign: textProps.textAlign,
        textBackgroundColor: textProps.backgroundColor || 'transparent',
      });
      canvas.requestRenderAll();
      syncToParent();
    }
  }, [textProps, syncToParent]);

  // Sync shape property changes to selected shape on canvas
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active && !(active instanceof fabric.Textbox) && !(active instanceof fabric.IText)) {
      if ('stroke' in active) active.set('stroke', shapeProps.stroke);
      if ('strokeWidth' in active) active.set('strokeWidth', shapeProps.strokeWidth);
      if ('fill' in active && shapeProps.fill !== undefined) active.set('fill', shapeProps.fill);
      canvas.requestRenderAll();
      syncToParent();
    }
  }, [shapeProps, syncToParent]);

  // Update tool settings & drawing modes on Fabric
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    if (activeTool === 'pen') {
      canvas.isDrawingMode = true;
      canvas.selection = false;
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      canvas.freeDrawingBrush.color = drawingProps.color;
      canvas.freeDrawingBrush.width = drawingProps.strokeWidth;
    } else if (activeTool === 'highlighter') {
      canvas.isDrawingMode = true;
      canvas.selection = false;
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      // Make highlighter semi-transparent
      const hex = drawingProps.highlighterColor;
      const r = parseInt(hex.slice(1, 3), 16) || 254;
      const g = parseInt(hex.slice(3, 5), 16) || 240;
      const b = parseInt(hex.slice(5, 7), 16) || 138;
      canvas.freeDrawingBrush.color = `rgba(${r}, ${g}, ${b}, 0.45)`;
      canvas.freeDrawingBrush.width = drawingProps.strokeWidth;
    } else {
      canvas.isDrawingMode = false;
      canvas.selection = true;
      canvas.defaultCursor =
        activeTool === 'select'
          ? 'default'
          : activeTool === 'text'
          ? 'text'
          : activeTool === 'check' || activeTool === 'cross'
          ? 'pointer'
          : 'crosshair';
    }
  }, [activeTool, drawingProps]);

  // Handle Shapes & Text Creation via Mouse Events
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const handleMouseDown = (opt: fabric.IEvent) => {
      const pointer = canvas.getPointer(opt.e);
      isMouseDownRef.current = true;
      startPointRef.current = { x: pointer.x, y: pointer.y };

      if (activeTool === 'text') {
        // If clicked on existing text object, enter edit mode on it
        if (opt.target && (opt.target instanceof fabric.Textbox || opt.target instanceof fabric.IText)) {
          canvas.setActiveObject(opt.target);
          (opt.target as fabric.Textbox).enterEditing();
          return;
        }

        // Otherwise create new Textbox
        const text = new fabric.Textbox('Type your text here', {
          left: pointer.x,
          top: pointer.y,
          width: 220,
          fontFamily: textProps.fontFamily,
          fontSize: textProps.fontSize,
          fill: textProps.fill,
          fontWeight: textProps.isBold ? 'bold' : 'normal',
          fontStyle: textProps.isItalic ? 'italic' : 'normal',
          underline: Boolean(textProps.isUnderline),
          linethrough: Boolean(textProps.isLinethrough),
          textAlign: textProps.textAlign,
          textBackgroundColor: textProps.backgroundColor || 'transparent',
          padding: 6,
          cornerColor: '#6366f1',
          cornerSize: 8,
          transparentCorners: false,
          borderColor: '#6366f1',
          editingBorderColor: '#6366f1',
          cursorColor: textProps.fill,
        });

        canvas.add(text);
        canvas.setActiveObject(text);
        text.enterEditing();
        text.selectAll();
        text.hiddenTextarea?.focus();
        canvas.requestRenderAll();

        pushHistory();
        syncToParent();

        // Switch back to select tool so dragging moves the text
        if (onSelectTool) {
          onSelectTool('select');
        }
      } else if (activeTool === 'check') {
        const checkColor = drawingProps.color || '#16a34a';
        const checkSize = Math.max(20, drawingProps.strokeWidth || 28);
        const checkmark = new fabric.Text('✓', {
          left: pointer.x - checkSize / 2,
          top: pointer.y - checkSize / 2,
          fontSize: checkSize,
          fontFamily: 'Helvetica, Arial, sans-serif',
          fontWeight: 'bold',
          fill: checkColor,
          cornerColor: '#10b981',
          cornerSize: 8,
          transparentCorners: false,
          padding: 4,
        });
        canvas.add(checkmark);
        canvas.setActiveObject(checkmark);
        canvas.requestRenderAll();
        pushHistory();
        syncToParent();
        if (onSelectTool) onSelectTool('select');
      } else if (activeTool === 'cross') {
        const crossColor = drawingProps.color || '#dc2626';
        const crossSize = Math.max(20, drawingProps.strokeWidth || 28);
        const crossmark = new fabric.Text('✕', {
          left: pointer.x - crossSize / 2,
          top: pointer.y - crossSize / 2,
          fontSize: crossSize,
          fontFamily: 'Helvetica, Arial, sans-serif',
          fontWeight: 'bold',
          fill: crossColor,
          cornerColor: '#ef4444',
          cornerSize: 8,
          transparentCorners: false,
          padding: 4,
        });
        canvas.add(crossmark);
        canvas.setActiveObject(crossmark);
        canvas.requestRenderAll();
        pushHistory();
        syncToParent();
        if (onSelectTool) onSelectTool('select');
      } else if (activeTool === 'redact') {
        // Create Redaction rectangle
        const rectColor = drawingProps.redactColor === 'black' ? '#000000' : '#ffffff';
        const rect = new fabric.Rect({
          left: pointer.x,
          top: pointer.y,
          width: 0,
          height: 0,
          fill: rectColor,
          stroke: drawingProps.redactColor === 'black' ? '#1e293b' : '#cbd5e1',
          strokeWidth: 1,
          opacity: 1,
          cornerColor: '#ef4444',
          cornerSize: 8,
          transparentCorners: false,
        });
        activeShapeRef.current = rect;
        canvas.add(rect);
      } else if (activeTool === 'rectangle') {
        const rect = new fabric.Rect({
          left: pointer.x,
          top: pointer.y,
          width: 0,
          height: 0,
          fill: shapeProps.fill,
          stroke: shapeProps.stroke,
          strokeWidth: shapeProps.strokeWidth,
          cornerColor: '#6366f1',
          cornerSize: 8,
          transparentCorners: false,
        });
        activeShapeRef.current = rect;
        canvas.add(rect);
      } else if (activeTool === 'circle') {
        const circle = new fabric.Circle({
          left: pointer.x,
          top: pointer.y,
          radius: 0,
          fill: shapeProps.fill,
          stroke: shapeProps.stroke,
          strokeWidth: shapeProps.strokeWidth,
          cornerColor: '#6366f1',
          cornerSize: 8,
          transparentCorners: false,
        });
        activeShapeRef.current = circle;
        canvas.add(circle);
      } else if (activeTool === 'line') {
        const line = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
          stroke: shapeProps.stroke,
          strokeWidth: shapeProps.strokeWidth,
          cornerColor: '#6366f1',
          cornerSize: 8,
          transparentCorners: false,
        });
        activeShapeRef.current = line;
        canvas.add(line);
      } else if (activeTool === 'arrow') {
        const line = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
          stroke: shapeProps.stroke,
          strokeWidth: shapeProps.strokeWidth,
        });
        activeShapeRef.current = line;
        canvas.add(line);
      }
    };

    const handleMouseMove = (opt: fabric.IEvent) => {
      if (!isMouseDownRef.current || !startPointRef.current || !activeShapeRef.current) return;
      const pointer = canvas.getPointer(opt.e);
      const startX = startPointRef.current.x;
      const startY = startPointRef.current.y;

      const shape = activeShapeRef.current;

      if (shape instanceof fabric.Rect) {
        shape.set({
          left: Math.min(startX, pointer.x),
          top: Math.min(startY, pointer.y),
          width: Math.abs(pointer.x - startX),
          height: Math.abs(pointer.y - startY),
        });
      } else if (shape instanceof fabric.Circle) {
        const radius = Math.sqrt(
          Math.pow(pointer.x - startX, 2) + Math.pow(pointer.y - startY, 2)
        ) / 2;
        shape.set({
          left: Math.min(startX, pointer.x),
          top: Math.min(startY, pointer.y),
          radius: radius,
        });
      } else if (shape instanceof fabric.Line) {
        shape.set({
          x2: pointer.x,
          y2: pointer.y,
        });
      }

      canvas.renderAll();
    };

    const handleMouseUp = () => {
      if (isMouseDownRef.current && activeShapeRef.current) {
        const shape = activeShapeRef.current;
        // If arrow tool, add arrowhead group
        if (activeTool === 'arrow' && shape instanceof fabric.Line && startPointRef.current) {
          const x1 = shape.x1 || startPointRef.current.x;
          const y1 = shape.y1 || startPointRef.current.y;
          const x2 = shape.x2 || x1 + 20;
          const y2 = shape.y2 || y1 + 20;
          const dx = x2 - x1;
          const dy = y2 - y1;
          const angle = Math.atan2(dy, dx);
          const headLen = 14 + shapeProps.strokeWidth * 2;

          const arrowHead = new fabric.Triangle({
            left: x2,
            top: y2,
            originX: 'center',
            originY: 'center',
            selectable: false,
            width: headLen,
            height: headLen,
            angle: (angle * 180) / Math.PI + 90,
            fill: shapeProps.stroke,
          });

          canvas.remove(shape);
          const arrowGroup = new fabric.Group([shape, arrowHead], {
            cornerColor: '#6366f1',
            transparentCorners: false,
          });
          canvas.add(arrowGroup);
          canvas.setActiveObject(arrowGroup);
        } else {
          canvas.setActiveObject(shape);
        }

        pushHistory();
        syncToParent();
      }

      isMouseDownRef.current = false;
      startPointRef.current = null;
      activeShapeRef.current = null;
    };

    canvas.on('mouse:down', handleMouseDown);
    canvas.on('mouse:move', handleMouseMove);
    canvas.on('mouse:up', handleMouseUp);

    return () => {
      canvas.off('mouse:down', handleMouseDown);
      canvas.off('mouse:move', handleMouseMove);
      canvas.off('mouse:up', handleMouseUp);
    };
  }, [activeTool, textProps, drawingProps, shapeProps, pushHistory, syncToParent]);

  // Insert Image (Signature / Stamp)
  useEffect(() => {
    if (!insertImageTrigger || !fabricCanvasRef.current) return;
    const canvas = fabricCanvasRef.current;

    fabric.Image.fromURL(insertImageTrigger.url, (img) => {
      img.scaleToWidth(Math.min(240, canvas.getWidth() * 0.4));
      img.set({
        left: canvas.getWidth() / 2 - (img.getScaledWidth() || 100) / 2,
        top: canvas.getHeight() / 2 - (img.getScaledHeight() || 50) / 2,
        cornerColor: '#6366f1',
        transparentCorners: false,
      });
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
      pushHistory();
      syncToParent();
    });
  }, [insertImageTrigger, pushHistory, syncToParent]);

  // Handle Delete Selected Object
  useEffect(() => {
    if (deleteTrigger === 0 || !fabricCanvasRef.current) return;
    const canvas = fabricCanvasRef.current;
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length > 0) {
      activeObjects.forEach((obj) => canvas.remove(obj));
      canvas.discardActiveObject();
      canvas.renderAll();
      onSelectionChange(false);
      pushHistory();
      syncToParent();
    }
  }, [deleteTrigger, onSelectionChange, pushHistory, syncToParent]);

  // Handle Undo
  useEffect(() => {
    if (undoTrigger === 0 || !fabricCanvasRef.current) return;
    if (historyIndexRef.current > 0) {
      isHistoryProcessing.current = true;
      historyIndexRef.current -= 1;
      const state = historyRef.current[historyIndexRef.current];
      fabricCanvasRef.current.loadFromJSON(JSON.parse(state), () => {
        fabricCanvasRef.current?.renderAll();
        isHistoryProcessing.current = false;
        onHistoryChange(
          historyIndexRef.current > 0,
          historyIndexRef.current < historyRef.current.length - 1
        );
        syncToParent();
      });
    }
  }, [undoTrigger, onHistoryChange, syncToParent]);

  // Handle Redo
  useEffect(() => {
    if (redoTrigger === 0 || !fabricCanvasRef.current) return;
    if (historyIndexRef.current < historyRef.current.length - 1) {
      isHistoryProcessing.current = true;
      historyIndexRef.current += 1;
      const state = historyRef.current[historyIndexRef.current];
      fabricCanvasRef.current.loadFromJSON(JSON.parse(state), () => {
        fabricCanvasRef.current?.renderAll();
        isHistoryProcessing.current = false;
        onHistoryChange(
          historyIndexRef.current > 0,
          historyIndexRef.current < historyRef.current.length - 1
        );
        syncToParent();
      });
    }
  }, [redoTrigger, onHistoryChange, syncToParent]);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-auto p-8 flex items-center justify-center bg-slate-100 dark:bg-[#080d1a] relative select-none"
    >
      <div className="relative canvas-container shadow-2xl rounded-sm overflow-hidden bg-white border border-slate-300 dark:border-slate-800">
        {/* Floating Contextual Text Formatting Bar */}
        {isTextSelected && (
          <FloatingTextBar
            textProps={textProps}
            onChange={(newProps) => {
              if (onTextPropsChange) onTextPropsChange(newProps);
            }}
            onDelete={() => {
              const canvas = fabricCanvasRef.current;
              if (canvas) {
                const active = canvas.getActiveObject();
                if (active) canvas.remove(active);
                canvas.discardActiveObject();
                canvas.renderAll();
                onSelectionChange(false);
                setIsTextSelected(false);
                pushHistory();
                syncToParent();
              }
            }}
            position={selectedTextPos}
          />
        )}

        {/* Bottom PDF Rendering Canvas */}
        <canvas ref={pdfCanvasRef} className="block pointer-events-none" />

        {/* Top Interactive Vector Canvas Overlay */}
        <div className="absolute inset-0 z-10">
          <canvas ref={fabricCanvasElementRef} />
        </div>
      </div>
    </div>
  );
};
