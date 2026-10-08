import React, { useState, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import {
  DrawingProperties,
  EditorPageInfo,
  EditorTool,
  PdfDocumentState,
  ShapeProperties,
  TextProperties,
  ToastMessage,
} from '../../types';
import { loadPdfDocument, renderPageThumbnail } from '../../lib/pdf-loader';
import { exportModifiedPdf, downloadPdfBlob } from '../../lib/pdf-engine';
import { ThumbnailSidebar } from './ThumbnailSidebar';
import { EditorToolbar } from './EditorToolbar';
import { CanvasWorkspace } from './CanvasWorkspace';
import { SignatureModal } from './SignatureModal';
import { StampSelectorModal } from './StampSelectorModal';
import { Button } from '../ui/Button';
import { FileUp, Sparkles, FileText, Lock, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PdfEditorStudioProps {
  onAddToast: (toast: Omit<ToastMessage, 'id'>) => void;
  isExporting: boolean;
  setIsExporting: (v: boolean) => void;
  zoom: number;
  setZoom: (z: number | ((prev: number) => number)) => void;
  canUndo: boolean;
  canRedo: boolean;
  setCanUndo: (v: boolean) => void;
  setCanRedo: (v: boolean) => void;
  undoTrigger: number;
  redoTrigger: number;
  registerExport?: (fn: () => void) => void;
}

export const PdfEditorStudio: React.FC<PdfEditorStudioProps> = ({
  onAddToast,
  isExporting,
  setIsExporting,
  zoom,
  setZoom,
  canUndo,
  canRedo,
  setCanUndo,
  setCanRedo,
  undoTrigger,
  redoTrigger,
  registerExport,
}) => {
  const [docState, setDocState] = useState<PdfDocumentState>({
    file: null,
    fileName: '',
    fileSize: 0,
    arrayBuffer: null,
    totalPages: 0,
    pages: [],
    currentPageIndex: 0,
    zoom: 1.0,
    isLoaded: false,
    isLoading: false,
    hasUnsavedChanges: false,
  });

  const pdfDocProxyRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Overlay Cache (pageIndex -> DataURL)
  const [pageOverlays, setPageOverlays] = useState<Record<number, string>>({});

  // Toolbar & Tool State
  const [activeTool, setActiveTool] = useState<EditorTool>('select');
  const [hasSelection, setHasSelection] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  // Modals
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState<boolean>(false);
  const [isStampModalOpen, setIsStampModalOpen] = useState<boolean>(false);

  // Insert image trigger (for signature / stamp)
  const [insertImageTrigger, setInsertImageTrigger] = useState<{
    url: string;
    timestamp: number;
  } | null>(null);

  // Delete trigger
  const [deleteTrigger, setDeleteTrigger] = useState<number>(0);

  // Tool properties
  const [textProps, setTextProps] = useState<TextProperties>({
    fontFamily: 'Helvetica, sans-serif',
    fontSize: 20,
    fill: '#0f172a',
    isBold: false,
    isItalic: false,
    textAlign: 'left',
    backgroundColor: 'transparent',
  });

  const [drawingProps, setDrawingProps] = useState<DrawingProperties>({
    color: '#ef4444',
    strokeWidth: 4,
    opacity: 1,
    highlighterColor: '#fef08a',
    redactColor: 'black',
  });

  const [shapeProps, setShapeProps] = useState<ShapeProperties>({
    fill: 'transparent',
    stroke: '#3b82f6',
    strokeWidth: 3,
    opacity: 1,
  });

  // Handle PDF Loading
  const handleLoadPdf = async (file: File) => {
    setDocState((prev) => ({ ...prev, isLoading: true }));
    try {
      const buffer = await file.arrayBuffer();
      const { pdfDoc, pages } = await loadPdfDocument(buffer);
      pdfDocProxyRef.current = pdfDoc;

      setDocState({
        file,
        fileName: file.name,
        fileSize: file.size,
        arrayBuffer: buffer,
        totalPages: pages.length,
        pages,
        currentPageIndex: 0,
        zoom: 1.0,
        isLoaded: true,
        isLoading: false,
        hasUnsavedChanges: false,
      });

      setPageOverlays({});
      onAddToast({
        type: 'success',
        title: 'PDF Loaded Successfully',
        description: `Loaded "${file.name}" with ${pages.length} pages.`,
      });
    } catch (err: any) {
      console.error(err);
      setDocState((prev) => ({ ...prev, isLoading: false }));
      onAddToast({
        type: 'error',
        title: 'Failed to load PDF',
        description: err.message || 'Please check that the file is a valid PDF.',
      });
    }
  };

  // Generate Sample Multi-Page PDF
  const handleLoadSamplePdf = async () => {
    setDocState((prev) => ({ ...prev, isLoading: true }));
    try {
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

      // Page 1: NDA / Agreement Cover
      const page1 = pdfDoc.addPage([600, 800]);
      page1.drawRectangle({
        x: 40,
        y: 40,
        width: 520,
        height: 720,
        borderColor: rgb(0.85, 0.88, 0.92),
        borderWidth: 2,
        color: rgb(0.98, 0.99, 1),
      });
      page1.drawText('MUTUAL NON-DISCLOSURE AGREEMENT', {
        x: 70,
        y: 710,
        size: 20,
        font,
        color: rgb(0.1, 0.15, 0.25),
      });
      page1.drawText('DocuStudio Enterprise Edition • Reference #DS-2026', {
        x: 70,
        y: 685,
        size: 10,
        font: regularFont,
        color: rgb(0.4, 0.45, 0.55),
      });
      page1.drawLine({
        start: { x: 70, y: 665 },
        end: { x: 530, y: 665 },
        thickness: 1.5,
        color: rgb(0.8, 0.85, 0.9),
      });

      const sampleLines = [
        '1. PURPOSE OF DISCLOSURE',
        'The Disclosing Party agrees to share proprietary specifications and evaluation',
        'materials with the Receiving Party solely for client-side integration and benchmarking.',
        '',
        '2. CONFIDENTIALITY OBLIGATIONS',
        'The Receiving Party shall safeguard all proprietary algorithms, source code, and user data',
        'with the highest degree of care and shall not disclose any portion to third parties.',
        '',
        '3. TERM AND TERMINATION',
        'This agreement becomes effective on the signature date and shall remain valid for 24 months.',
        '',
        '4. SENSITIVE ACCOUNT NUMBER: [Redact here: 4912-8830-1092-4411]',
        'Please verify and place digital signature in the box below.',
      ];

      let currentY = 620;
      for (const line of sampleLines) {
        if (line.startsWith('1.') || line.startsWith('2.') || line.startsWith('3.') || line.startsWith('4.')) {
          page1.drawText(line, { x: 70, y: currentY, size: 12, font, color: rgb(0.15, 0.2, 0.3) });
        } else {
          page1.drawText(line, { x: 70, y: currentY, size: 10, font: regularFont, color: rgb(0.3, 0.35, 0.45) });
        }
        currentY -= 22;
      }

      // Signature area box
      page1.drawRectangle({
        x: 70,
        y: 120,
        width: 220,
        height: 90,
        borderColor: rgb(0.7, 0.75, 0.85),
        borderWidth: 1.5,
        color: rgb(1, 1, 1),
      });
      page1.drawText('Authorized Signature', {
        x: 80,
        y: 190,
        size: 10,
        font,
        color: rgb(0.3, 0.35, 0.45),
      });
      page1.drawLine({
        start: { x: 80, y: 140 },
        end: { x: 270, y: 140 },
        thickness: 1,
        color: rgb(0.7, 0.75, 0.85),
      });
      page1.drawText('Sign here (Use the Sign tool)', {
        x: 80,
        y: 128,
        size: 8,
        font: regularFont,
        color: rgb(0.5, 0.55, 0.65),
      });

      // Page 2: Summary Specification
      const page2 = pdfDoc.addPage([600, 800]);
      page2.drawRectangle({
        x: 40,
        y: 40,
        width: 520,
        height: 720,
        borderColor: rgb(0.85, 0.88, 0.92),
        borderWidth: 2,
        color: rgb(0.98, 0.99, 1),
      });
      page2.drawText('EXHIBIT A: ARCHITECTURE OVERVIEW', {
        x: 70,
        y: 710,
        size: 18,
        font,
        color: rgb(0.1, 0.15, 0.25),
      });
      page2.drawText('Document Processing & Client-Side Canvas Engine', {
        x: 70,
        y: 685,
        size: 10,
        font: regularFont,
        color: rgb(0.4, 0.45, 0.55),
      });
      page2.drawLine({
        start: { x: 70, y: 665 },
        end: { x: 530, y: 665 },
        thickness: 1.5,
        color: rgb(0.8, 0.85, 0.9),
      });

      const page2Lines = [
        'SYSTEM HIGHLIGHTS:',
        '• Zero server round-trips for complete privacy and instant feedback.',
        '• Dual-layer HTML5 + Fabric.js rendering ensures vector fidelity.',
        '• Dynamic coordinate space mapping for accurate byte-level PDF exports.',
        '• Multi-page reordering, rotation, stamp generation, and whiteout redaction.',
      ];
      let p2Y = 620;
      for (const line of page2Lines) {
        page2.drawText(line, {
          x: 70,
          y: p2Y,
          size: 11,
          font: line.startsWith('SYSTEM') ? font : regularFont,
          color: rgb(0.2, 0.25, 0.35),
        });
        p2Y -= 28;
      }

      const pdfBytes = await pdfDoc.save();
      const demoFile = new File([pdfBytes.buffer as ArrayBuffer], 'DocuStudio_Sample_Agreement.pdf', {
        type: 'application/pdf',
      });
      await handleLoadPdf(demoFile);
    } catch (err: any) {
      console.error(err);
      setDocState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // Page Operations
  const handleSelectPage = (index: number) => {
    setDocState((prev) => ({ ...prev, currentPageIndex: index }));
  };

  const handleRotatePage = async (index: number) => {
    setDocState((prev) => {
      const updatedPages = prev.pages.map((p, i) =>
        i === index ? { ...p, rotation: (p.rotation + 90) % 360 } : p
      );
      return { ...prev, pages: updatedPages, hasUnsavedChanges: true };
    });

    if (pdfDocProxyRef.current) {
      const targetPage = docState.pages[index];
      const newThumb = await renderPageThumbnail(
        pdfDocProxyRef.current,
        targetPage.originalPageIndex + 1,
        (targetPage.rotation + 90) % 360
      );
      setDocState((prev) => {
        const updated = prev.pages.map((p, i) =>
          i === index ? { ...p, thumbnailUrl: newThumb } : p
        );
        return { ...prev, pages: updated };
      });
    }
  };

  const handleDuplicatePage = (index: number) => {
    const pageToDup = docState.pages[index];
    const newPage: EditorPageInfo = {
      ...pageToDup,
      pageIndex: docState.pages.length,
      pageNumber: docState.pages.length + 1,
    };
    const newPages = [...docState.pages];
    newPages.splice(index + 1, 0, newPage);
    setDocState((prev) => ({
      ...prev,
      pages: newPages,
      totalPages: newPages.length,
      currentPageIndex: index + 1,
      hasUnsavedChanges: true,
    }));
  };

  const handleDeletePage = (index: number) => {
    if (docState.pages.length <= 1) return;
    const newPages = docState.pages.filter((_, i) => i !== index);
    const newCurrentIndex = Math.min(index, newPages.length - 1);
    setDocState((prev) => ({
      ...prev,
      pages: newPages,
      totalPages: newPages.length,
      currentPageIndex: newCurrentIndex,
      hasUnsavedChanges: true,
    }));
  };

  const handleReorderPages = (newPages: EditorPageInfo[]) => {
    setDocState((prev) => ({ ...prev, pages: newPages, hasUnsavedChanges: true }));
  };

  const handleAddBlankPage = () => {
    const newPage: EditorPageInfo = {
      pageIndex: docState.pages.length,
      pageNumber: docState.pages.length + 1,
      originalPageIndex: 0, // Fallback to first page template
      rotation: 0,
      width: 595.28,
      height: 841.89,
      aspectRatio: 595.28 / 841.89,
      thumbnailUrl: '',
    };
    setDocState((prev) => ({
      ...prev,
      pages: [...prev.pages, newPage],
      totalPages: prev.pages.length + 1,
      currentPageIndex: prev.pages.length,
      hasUnsavedChanges: true,
    }));
  };

  // Annotation Caching
  const handleSavePageAnnotations = (pageIndex: number, json: any, dataUrl: string) => {
    setDocState((prev) => ({
      ...prev,
      pages: prev.pages.map((p) => (p.pageIndex === pageIndex ? { ...p, fabricJson: json } : p)),
      hasUnsavedChanges: true,
    }));
    setPageOverlays((prev) => ({
      ...prev,
      [pageIndex]: dataUrl,
    }));
  };

  // Signatures & Stamps
  const handleApplySignature = (dataUrl: string) => {
    setInsertImageTrigger({ url: dataUrl, timestamp: Date.now() });
    onAddToast({
      type: 'success',
      title: 'Signature Added',
      description: 'You can drag, resize, or rotate your signature on the page.',
    });
  };

  const handleApplyStamp = (dataUrl: string) => {
    setInsertImageTrigger({ url: dataUrl, timestamp: Date.now() });
    onAddToast({
      type: 'success',
      title: 'Stamp Added',
      description: 'Position your stamp anywhere on the active document page.',
    });
  };

  // Export Modified PDF
  const handleExportPdf = async () => {
    if (!docState.arrayBuffer || docState.pages.length === 0) {
      onAddToast({
        type: 'warning',
        title: 'No Document Open',
        description: 'Please open or load a PDF agreement to annotate before downloading.',
      });
      return;
    }
    setIsExporting(true);
    try {
      const exportedBytes = await exportModifiedPdf(
        docState.arrayBuffer,
        docState.pages,
        pageOverlays
      );

      const outName = docState.fileName
        ? docState.fileName.replace(/\.pdf$/i, '_annotated.pdf')
        : 'DocuStudio_Edited.pdf';
      downloadPdfBlob(exportedBytes, outName);

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });

      onAddToast({
        type: 'success',
        title: 'Document Exported Successfully!',
        description: `Downloaded "${outName}" with all annotations preserved to your computer.`,
      });
    } catch (err: any) {
      console.error(err);
      onAddToast({
        type: 'error',
        title: 'Export Failed',
        description: err.message || 'Could not compile exported PDF.',
      });
    } finally {
      setIsExporting(false);
    }
  };

  React.useEffect(() => {
    if (registerExport) {
      registerExport(handleExportPdf);
    }
  }, [registerExport, docState.arrayBuffer, docState.pages, pageOverlays, docState.fileName]);

  const currentPage = docState.pages[docState.currentPageIndex] || null;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] w-full overflow-hidden bg-slate-100 dark:bg-[#070b14]">
      {/* Hidden native file input for PDF loading */}
      <input
        ref={pdfInputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleLoadPdf(file);
            e.target.value = ''; // Reset so same file can be reselected
          }
        }}
        className="hidden"
      />

      {!docState.isLoaded ? (
        /* Empty Dropzone State */
        <div className="flex-1 flex items-center justify-center p-6">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragOver(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragOver(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragOver(false);
              const file = e.dataTransfer.files?.[0];
              if (file && (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))) {
                handleLoadPdf(file);
              } else if (file) {
                onAddToast({
                  type: 'error',
                  title: 'Invalid File',
                  description: 'Please upload a valid PDF document (.pdf).',
                });
              }
            }}
            className={`max-w-xl w-full p-10 sm:p-14 rounded-3xl border-2 border-dashed transition-all duration-300 bg-white dark:bg-slate-900 shadow-xl flex flex-col items-center text-center animate-fade-in ${
              isDragOver
                ? 'border-brand-500 bg-brand-500/10 scale-[1.01] shadow-brand-500/20'
                : 'border-slate-300 dark:border-slate-800 hover:border-brand-500/60'
            }`}
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-brand-500/25 mb-6">
              <FileUp className="w-10 h-10" />
            </div>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Open a PDF to Edit & Annotate
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-sm">
              Add signatures, highlight, draw redaction boxes, insert text, and organize pages
              directly in your browser.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={() => pdfInputRef.current?.click()}
                className="shadow-lg shadow-brand-600/25"
              >
                <FileText className="w-4 h-4" />
                <span>Choose PDF File</span>
              </Button>

              <Button
                variant="secondary"
                size="lg"
                onClick={handleLoadSamplePdf}
                isLoading={docState.isLoading}
                className="border-dashed"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Load Sample Agreement</span>
              </Button>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 w-full flex items-center justify-around text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> Zero Upload to Cloud
              </span>
              <span className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-brand-500" /> 100% Private & Local
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Active Editor Workspace */
        <div className="flex flex-col flex-1 h-full overflow-hidden">
          {/* Top Floating / Docked Toolbar */}
          <EditorToolbar
            activeTool={activeTool}
            onSelectTool={setActiveTool}
            textProps={textProps}
            onTextPropsChange={(p) => setTextProps((prev) => ({ ...prev, ...p }))}
            drawingProps={drawingProps}
            onDrawingPropsChange={(p) => setDrawingProps((prev) => ({ ...prev, ...p }))}
            shapeProps={shapeProps}
            onShapePropsChange={(p) => setShapeProps((prev) => ({ ...prev, ...p }))}
            onOpenSignatureModal={() => setIsSignatureModalOpen(true)}
            onOpenStampModal={() => setIsStampModalOpen(true)}
            onDeleteSelected={() => setDeleteTrigger(Date.now())}
            hasSelection={hasSelection}
            onOpenFile={() => pdfInputRef.current?.click()}
          />

          {/* Main workspace with Sidebar & Canvas */}
          <div className="flex flex-1 overflow-hidden relative">
            <ThumbnailSidebar
              pages={docState.pages}
              currentPageIndex={docState.currentPageIndex}
              onSelectPage={handleSelectPage}
              onRotatePage={handleRotatePage}
              onDuplicatePage={handleDuplicatePage}
              onDeletePage={handleDeletePage}
              onReorderPages={handleReorderPages}
              onAddBlankPage={handleAddBlankPage}
              isOpen={isSidebarOpen}
              onToggleOpen={() => setIsSidebarOpen(!isSidebarOpen)}
            />

            <CanvasWorkspace
              pdfDoc={pdfDocProxyRef.current}
              currentPage={currentPage}
              zoom={zoom}
              activeTool={activeTool}
              onSelectTool={setActiveTool}
              textProps={textProps}
              onTextPropsChange={(p) => setTextProps((prev) => ({ ...prev, ...p }))}
              drawingProps={drawingProps}
              shapeProps={shapeProps}
              onSelectionChange={setHasSelection}
              onSavePageAnnotations={handleSavePageAnnotations}
              onHistoryChange={(undo, redo) => {
                setCanUndo(undo);
                setCanRedo(redo);
              }}
              undoTrigger={undoTrigger}
              redoTrigger={redoTrigger}
              deleteTrigger={deleteTrigger}
              insertImageTrigger={insertImageTrigger}
            />
          </div>
        </div>
      )}

      {/* Signature Modal */}
      <SignatureModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        onApplySignature={handleApplySignature}
      />

      {/* Stamp Modal */}
      <StampSelectorModal
        isOpen={isStampModalOpen}
        onClose={() => setIsStampModalOpen(false)}
        onSelectStamp={handleApplyStamp}
      />
    </div>
  );
};
