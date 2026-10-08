import React, { useState, useRef, useEffect } from 'react';
import { AppMode, ToastMessage } from './types';
import { Navbar } from './components/layout/Navbar';
import { ToastContainer } from './components/ui/Toast';
import { ImageMakerStudio } from './components/pdf-maker/ImageMakerStudio';
import { PdfEditorStudio } from './components/pdf-editor/PdfEditorStudio';

export function App() {
  const [mode, setMode] = useState<AppMode>('maker');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Editor Viewport & History State
  const [zoom, setZoom] = useState<number>(1.0);
  const [canUndo, setCanUndo] = useState<boolean>(false);
  const [canRedo, setCanRedo] = useState<boolean>(false);
  const [undoTrigger, setUndoTrigger] = useState<number>(0);
  const [redoTrigger, setRedoTrigger] = useState<number>(0);

  // Export references for header triggering
  const makerExportTriggerRef = useRef<() => void>(() => {});
  const editorExportTriggerRef = useRef<() => void>(() => {});

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Keyboard Shortcuts for Undo/Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          (activeEl as HTMLElement).isContentEditable)
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          // Redo: Ctrl+Shift+Z
          e.preventDefault();
          if (canRedo) setRedoTrigger(Date.now());
        } else {
          // Undo: Ctrl+Z
          e.preventDefault();
          if (canUndo) setUndoTrigger(Date.now());
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        // Redo: Ctrl+Y
        e.preventDefault();
        if (canRedo) setRedoTrigger(Date.now());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo]);

  const handleZoomIn = () => setZoom((prev) => Math.min(2.5, +(prev + 0.15).toFixed(2)));
  const handleZoomOut = () => setZoom((prev) => Math.max(0.3, +(prev - 0.15).toFixed(2)));
  const handleZoomFit = () => setZoom(1.0);

  const handleNavbarExport = () => {
    if (mode === 'maker') {
      makerExportTriggerRef.current();
    } else {
      editorExportTriggerRef.current();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 selection:bg-brand-500 selection:text-white">
      {/* Top Main Navigation Bar */}
      <Navbar
        mode={mode}
        onModeChange={setMode}
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomFit={handleZoomFit}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={() => setUndoTrigger(Date.now())}
        onRedo={() => setRedoTrigger(Date.now())}
        onExport={handleNavbarExport}
        isExporting={isExporting}
        exportDisabled={false}
        exportLabel={mode === 'maker' ? 'Generate PDF' : 'Download PDF'}
      />

      {/* Main Studio Viewport */}
      <main className="flex-1 flex flex-col">
        {mode === 'maker' ? (
          <ImageMakerStudio
            onAddToast={addToast}
            isExporting={isExporting}
            setIsExporting={setIsExporting}
            registerExport={(fn) => {
              makerExportTriggerRef.current = fn;
            }}
          />
        ) : (
          <PdfEditorStudio
            onAddToast={addToast}
            isExporting={isExporting}
            setIsExporting={setIsExporting}
            zoom={zoom}
            setZoom={setZoom}
            canUndo={canUndo}
            canRedo={canRedo}
            setCanUndo={setCanUndo}
            setCanRedo={setCanRedo}
            undoTrigger={undoTrigger}
            redoTrigger={redoTrigger}
            registerExport={(fn) => {
              editorExportTriggerRef.current = fn;
            }}
          />
        )}
      </main>

      {/* Global Notification Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

export default App;
