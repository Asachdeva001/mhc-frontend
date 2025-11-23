'use client';

import { useRef, useEffect, useState } from 'react';

// --- Icons ---
const BrushIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83zM3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"/></svg>
);
const EraserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm-1 23H7c-1.1 0-2-.9-2-2v-2c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2v2c0 1.1-.9 2-2 2z" transform="rotate(-45 12 12)"/></svg>
);
const UndoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
);
const RedoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/></svg>
);

export default function Doodle({ activity, onComplete }) {
  const canvasRef = useRef(null);
  const parentRef = useRef(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('brush'); // 'brush' | 'eraser'
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Configuration
  const STROKE_COLOR = '#0ea5a4';
  const STROKE_WIDTH = 4;
  const ERASER_WIDTH = 24;

  // 1. INITIAL SETUP & RESIZING
  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = parentRef.current;
    
    if (!canvas || !parent) return;

    const setCanvasSize = () => {
      // Get the exact size of the container div
      const rect = parent.getBoundingClientRect();
      
      // Set internal resolution to match display size (crisp drawing)
      canvas.width = rect.width;
      canvas.height = rect.height;

      // Reset context styles after resize (canvas clears on resize)
      const ctx = canvas.getContext('2d');
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      
      // If we have history, restore the last image
      if (history.length > 0 && historyIndex >= 0) {
        const img = new Image();
        img.src = history[historyIndex];
        img.onload = () => ctx.drawImage(img, 0, 0);
      }
    };

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Initialize history with blank state ONLY once
    if (history.length === 0) {
      const blank = canvas.toDataURL();
      setHistory([blank]);
      setHistoryIndex(0);
    }

    return () => window.removeEventListener('resize', setCanvasSize);
  }, []);

  // 2. COORDINATE CALCULATION (Crucial for Alignment)
  const getEventPosition = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Handle both Touch and Mouse events
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    // Direct calculation: canvas internal pixel position
    // No scaling needed - canvas is full width/height
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  // 3. DRAWING LOGIC
  const startDrawing = (e) => {
    // Prevent default only if necessary to stop some weird browser dragging
    // e.preventDefault(); 
    
    const { x, y } = getEventPosition(e);
    const ctx = canvasRef.current.getContext('2d');
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);

    // Set Tool Styles
    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = ERASER_WIDTH;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = STROKE_COLOR;
      ctx.lineWidth = STROKE_WIDTH;
    }
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const { x, y } = getEventPosition(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.closePath();
    ctx.globalCompositeOperation = 'source-over'; // Reset

    // Always save to history after drawing
    setTimeout(() => {
      const newImage = canvas.toDataURL();
      setHistory(prevHistory => {
        const newHistory = prevHistory.slice(0, historyIndex + 1);
        newHistory.push(newImage);
        setHistoryIndex(newHistory.length - 1);
        return newHistory;
      });
    }, 0);
  };

  // 4. HISTORY LOGIC
  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      restoreCanvas(history[newIndex]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      restoreCanvas(history[newIndex]);
    }
  };

  const restoreCanvas = (dataUrl) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const blank = canvas.toDataURL();
    const newHistory = [...history.slice(0, historyIndex + 1), blank];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // 5. DYNAMIC CURSOR (Circular for both Brush and Eraser)
  const getCursor = () => {
    const size = tool === 'eraser' ? ERASER_WIDTH : STROKE_WIDTH;
    const color = tool === 'eraser' ? 'white' : 'rgba(14, 165, 164, 0.3)';
    const borderColor = tool === 'eraser' ? 'black' : 'rgb(14, 165, 164)';
    
    // Create circular cursor with border
    const svg = `
      <svg width="${size * 2}" height="${size * 2}" viewBox="0 0 ${size * 2} ${size * 2}" xmlns="http://www.w3.org/2000/svg">
        <circle cx="${size}" cy="${size}" r="${size - 1}" fill="${color}" stroke="${borderColor}" stroke-width="2" />
      </svg>
    `;
    const url = `data:image/svg+xml;base64,${btoa(svg)}`;
    return `url("${url}") ${size} ${size}, auto`;
  };

  return (
    <div className="w-full flex flex-col items-center max-w-4xl mx-auto px-2 sm:px-4 md:px-6">
      <div className="mb-3 sm:mb-4 text-slate-700 font-medium text-center text-sm sm:text-base">
        {activity?.description || "Draw below!"}
      </div>

      {/* Controls - Responsive */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 mb-3 sm:mb-4 w-full justify-between items-center bg-slate-100 p-2 sm:p-3 md:p-4 rounded-lg border border-slate-200">
        {/* Tool Selection */}
        <div className="flex gap-1 sm:gap-2">
          <button
            onClick={() => setTool('brush')}
            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md transition-all text-sm sm:text-base ${
              tool === 'brush' 
              ? 'bg-white text-teal-600 shadow ring-1 ring-teal-600' 
              : 'text-slate-600 hover:bg-slate-200'
            }`}
            title="Brush Tool"
          >
            <BrushIcon /> <span className="hidden sm:inline font-medium">Brush</span>
          </button>
          
          <button
            onClick={() => setTool('eraser')}
            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md transition-all text-sm sm:text-base ${
              tool === 'eraser' 
              ? 'bg-white text-teal-600 shadow ring-1 ring-teal-600' 
              : 'text-slate-600 hover:bg-slate-200'
            }`}
            title="Eraser Tool"
          >
            <EraserIcon /> <span className="hidden sm:inline font-medium">Eraser</span>
          </button>
        </div>

        {/* Undo/Redo Buttons */}
        <div className="flex gap-0.5 sm:gap-1">
          <button 
            onClick={undo} 
            disabled={historyIndex <= 0}
            className="p-1.5 sm:p-2 rounded hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <UndoIcon />
          </button>
          <button 
            onClick={redo} 
            disabled={historyIndex >= history.length - 1}
            className="p-1.5 sm:p-2 rounded hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 transition-colors"
            title="Redo (Ctrl+Y)"
          >
            <RedoIcon />
          </button>
        </div>
      </div>

      {/* CANVAS CONTAINER - Fully Responsive
        Mobile: max 60vh height, smaller padding
        Tablet: 70vh height, medium padding
        Desktop: 400px fixed height, standard padding
      */}
      <div 
        ref={parentRef}
        className="relative w-full bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden"
        style={{ 
          height: 'calc(100vw - 32px)', // Mobile: square aspect ratio (with 16px padding on sides)
          maxHeight: '60vh', // Mobile cap
          touchAction: 'none', // CRITICAL: Prevents scrolling on mobile touches
          cursor: getCursor() // Dynamic cursor style
        }}
        onContextMenu={(e) => e.preventDefault()} // Disable right-click menu
      >
        <canvas
          ref={canvasRef}
          className="block w-full h-full touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={(e) => { e.preventDefault(); startDrawing(e); }}
          onTouchMove={(e) => { e.preventDefault(); draw(e); }}
          onTouchEnd={(e) => { e.preventDefault(); stopDrawing(); }}
        />
      </div>

      {/* Action Buttons - Responsive */}
      <div className="mt-3 sm:mt-4 md:mt-6 flex gap-2 sm:gap-3 justify-center w-full flex-wrap">
        <button 
          onClick={clearCanvas}
          className="px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-3 rounded bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors font-medium text-sm sm:text-base active:scale-95"
        >
          Clear
        </button>
        
        {onComplete && (
          <button 
            onClick={() => onComplete(canvasRef.current?.toDataURL())}
            className="px-4 sm:px-6 md:px-8 py-1.5 sm:py-2 md:py-3 rounded bg-teal-600 text-white hover:bg-teal-700 transition-colors font-medium text-sm sm:text-base shadow-sm active:scale-95"
          >
            Done
          </button>
        )}
      </div>

      {/* Debug Info - Mobile Only */}
      <div className="mt-2 text-xs text-slate-400 text-center hidden sm:hidden">
        History: {historyIndex + 1} / {history.length}
      </div>
    </div>
  );
}