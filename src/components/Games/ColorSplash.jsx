'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];

const ColorSplash = () => {
  const [splashes, setSplashes] = useState([]);
  const [ripples, setRipples] = useState([]);

  const playSplashSound = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.3);

    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const id = Date.now();

    setSplashes(prev => [...prev, { id, x, y, color }]);
    setRipples(prev => [...prev, { id, x, y, color }]);

    playSplashSound();

    // Remove after animation
    setTimeout(() => {
      setSplashes(prev => prev.filter(s => s.id !== id));
      setRipples(prev => prev.filter(r => r.id !== id));
    }, 2000);
  };

  return (
    <div
      className="relative w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg cursor-pointer overflow-hidden"
      onClick={handleClick}
    >
      <div className="absolute top-2 left-2 text-slate-700 text-sm font-medium bg-white/70 px-2 py-1 rounded">
        Click anywhere to create color splashes
      </div>
      <AnimatePresence>
        {splashes.map(splash => (
          <motion.div
            key={splash.id}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 15, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: 'easeOut' }}
            className="absolute rounded-full blur-sm pointer-events-none"
            style={{
              left: splash.x,
              top: splash.y,
              width: 20,
              height: 20,
              backgroundColor: splash.color,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
        {ripples.map(ripple => (
          <motion.div
            key={`ripple-${ripple.id}`}
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 20, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="absolute border-2 rounded-full pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: 20,
              height: 20,
              borderColor: ripple.color,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
      </AnimatePresence>
      <div className="absolute inset-0 flex items-center justify-center text-slate-500 pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-center"
        >
          <div className="text-4xl mb-2">🎨</div>
          <p>Tap to splash colors</p>
        </motion.div>
      </div>
    </div>
  );
};

export default ColorSplash;
