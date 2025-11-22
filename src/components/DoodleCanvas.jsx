'use client';

import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, RotateCcw, RotateCw, Trash2 } from 'lucide-react';

const COLORS = [
  { name: 'Teal', value: '#0ea5a4' },
  { name: 'Black', value: '#000000' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Pink', value: '#ec4899' },
];

export default function DoodleCanvas({ activity, onClose, onComplete }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState('#0ea5a4');
  const [brushSize, setBrushSize] = useState(4);
  const [isEraser, setIsEraser] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth * 0.8 : 800);
  const [windowHeight, setWindowHeight] = useState(typeof window !== 'undefined' ? window.innerHeight * 0.8 : 600);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const canvasContainerRef = useRef(null);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.width = windowWidth - 20;
    canvas.height = windowHeight - 120;
    
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Save initial state to history
    saveToHistory();
  }, []);

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(canvas.toDataURL());
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const undo = () => {
    if (historyStep > 0) {
      const newStep = historyStep - 1;
      setHistoryStep(newStep);
      restoreFromHistory(newStep);
    }
  };

  const redo = () => {
    if (historyStep < history.length - 1) {
      const newStep = historyStep + 1;
      setHistoryStep(newStep);
      restoreFromHistory(newStep);
    }
  };

  const restoreFromHistory = (step) => {
    const canvas = canvasRef.current;
    if (!canvas || !history[step]) return;
    
    const img = new Image();
    img.src = history[step];
    img.onload = () => {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  };

  const startDrawing = (e) => {
    if (!canvasRef.current) return;
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    
    ctx.lastX = e.clientX - rect.left;
    ctx.lastY = e.clientY - rect.top;
  };

  const draw = (e) => {
    if (!isDrawing || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(ctx.lastX, ctx.lastY);
    ctx.lineTo(x, y);
    ctx.lineWidth = brushSize;
    
    if (isEraser) {
      ctx.clearRect(x - brushSize / 2, y - brushSize / 2, brushSize, brushSize);
    } else {
      ctx.strokeStyle = currentColor;
      ctx.stroke();
    }
    
    ctx.lastX = x;
    ctx.lastY = y;
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    saveToHistory();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    saveToHistory();
  };

  const handleMouseMove = (e) => {
    if (isResizing) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      setWindowWidth(prev => Math.max(400, prev + deltaX));
      setWindowHeight(prev => Math.max(300, prev + deltaY));
      setDragStart({ x: e.clientX, y: e.clientY });
    }
    draw(e);
  };

  const handleMouseDown = (e) => {
    if (e.button === 0) {
      startDrawing(e);
    }
  };

  const handleResizeStart = (e) => {
    e.preventDefault();
    setIsResizing(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setIsResizing(false);
  };

  const handleClose = () => {
    onClose();
  };

  const handleComplete = () => {
    onComplete(activity.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        ref={canvasContainerRef}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col relative"
        style={{
          width: windowWidth,
          height: windowHeight,
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-sky-600 text-white p-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{activity.title}</h2>
            <p className="text-sm text-white/80">{activity.description}</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/20 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Toolbar */}
        <div className="bg-slate-100 border-b border-slate-200 p-3 flex items-center gap-4 flex-wrap">
          {/* Color Picker */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700">Colors:</span>
            <div className="flex gap-2">
              {COLORS.map(color => (
                <button
                  key={color.value}
                  onClick={() => {
                    setCurrentColor(color.value);
                    setIsEraser(false);
                  }}
                  className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                    !isEraser && currentColor === color.value
                      ? 'border-slate-800 scale-110'
                      : 'border-slate-300'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Brush Size */}
          <div className="flex items-center gap-3 border-l border-slate-300 pl-4">
            <span className="text-sm font-medium text-slate-700">Brush:</span>
            <input
              type="range"
              min="1"
              max="50"
              value={brushSize}
              onChange={(e) => {
                setBrushSize(Number(e.target.value));
                setIsEraser(false);
              }}
              className="w-32 cursor-pointer"
            />
            <span className="text-sm text-slate-600 w-8">{brushSize}px</span>
          </div>

          {/* Eraser */}
          <button
            onClick={() => setIsEraser(!isEraser)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all border-2 ${
              isEraser
                ? 'bg-pink-500 text-white border-pink-600'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            🧹 Eraser
          </button>

          {/* Undo/Redo */}
          <div className="flex gap-2 border-l border-slate-300 pl-4">
            <button
              onClick={undo}
              disabled={historyStep <= 0}
              className="p-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              title="Undo"
            >
              <RotateCcw size={18} className="text-slate-700" />
            </button>
            <button
              onClick={redo}
              disabled={historyStep >= history.length - 1}
              className="p-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              title="Redo"
            >
              <RotateCw size={18} className="text-slate-700" />
            </button>
          </div>

          {/* Clear */}
          <button
            onClick={clearCanvas}
            className="px-3 py-1.5 rounded-lg font-medium bg-red-100 text-red-700 border border-red-300 hover:bg-red-200 transition flex items-center gap-2"
          >
            <Trash2 size={16} />
            Clear
          </button>
        </div>

        {/* Canvas */}
        <div className="flex-grow bg-white overflow-hidden relative">
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="cursor-crosshair w-full h-full"
          />
        </div>

        {/* Footer with Actions */}
        <div className="bg-slate-100 border-t border-slate-200 p-4 flex items-center justify-between">
          <div className="text-sm text-slate-600">
            {isEraser ? '🧹 Eraser mode' : `✏️ Drawing with ${currentColor}`}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="px-6 py-2 rounded-full bg-slate-300 text-slate-800 font-medium hover:bg-slate-400 transition"
            >
              Exit
            </button>
            <button
              onClick={handleComplete}
              className="px-6 py-2 rounded-full bg-gradient-to-r from-teal-500 to-sky-600 text-white font-medium hover:shadow-lg transition"
            >
              Done
            </button>
          </div>
        </div>

        {/* Resize Handle */}
        <div
          onMouseDown={handleResizeStart}
          className="absolute bottom-0 right-0 w-6 h-6 bg-gradient-to-tl from-teal-500 to-transparent cursor-se-resize rounded-tl-lg hover:from-teal-600"
          title="Resize window"
        />
      </motion.div>
    </div>
  );
}
