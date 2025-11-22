'use client';

import { useRef, useEffect } from 'react';

export default function Doodle({ activity, onComplete, onClose, timeRemaining: initialTime, formatTime: formatTimeFunc }){
  const canvasRef = useRef(null);

  useEffect(()=>{
    const canvas = canvasRef.current;
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = 4;
  },[]);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    ctx.lastX = e.clientX - rect.left;
    ctx.lastY = e.clientY - rect.top;
  };

  const draw = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if(!ctx.isDrawing) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(ctx.lastX, ctx.lastY);
    ctx.lineTo(x,y);
    ctx.strokeStyle = '#0ea5a4';
    ctx.stroke();
    ctx.lastX = x; ctx.lastY = y;
  };

  const stop = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.isDrawing = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,canvas.width,canvas.height);
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="mb-4 text-slate-700">{activity.description}</div>
      <canvas
        ref={canvasRef}
        width={600}
        height={360}
        className="rounded-lg shadow-md bg-white"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stop}
        onMouseLeave={stop}
      />
      <div className="mt-4 flex gap-3 justify-center">
        <button onClick={clearCanvas} className="bg-slate-500 text-white py-2 px-4 rounded font-medium hover:bg-slate-600 transition-colors">Clear Canvas</button>
      </div>
    </div>
  );
}
