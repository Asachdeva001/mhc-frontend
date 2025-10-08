'use client';

import { motion } from 'framer-motion';
import { useState, useRef } from 'react';

const shapes = [
  { name: 'Ball', className: 'rounded-full bg-blue-500' },
  { name: 'Cube', className: 'rounded-lg bg-red-500' },
  { name: 'Slime', className: 'rounded-full bg-green-400' },
  { name: 'Heart', className: 'rounded-full bg-pink-500', extra: '❤️' },
  { name: 'Star', className: 'bg-yellow-500', extra: '⭐' },
];

const StressBall = () => {
  const [isPressed, setIsPressed] = useState(false);
  const [pressCount, setPressCount] = useState(0);
  const [shapeIndex, setShapeIndex] = useState(0);
  const audioRef = useRef(null);
  const shape = shapes[shapeIndex];

  const playSquishSound = () => {
    if (!audioRef.current) {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.2);

      gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);

      audioRef.current = true;
      setTimeout(() => { audioRef.current = null; }, 300);
    }
  };

  const handlePress = () => {
    setIsPressed(true);
    setPressCount(prev => prev + 1);
    playSquishSound();
  };

  const handleRelease = () => {
    setIsPressed(false);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-b from-orange-100 to-yellow-100 rounded-lg">
      <div className="text-slate-700 text-sm font-medium bg-white/70 px-2 py-1 rounded mb-4">
        Click and hold to squish
      </div>
      <motion.div
        animate={{
          scale: isPressed ? 0.7 : 1,
          rotate: isPressed ? 5 : 0,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        onMouseDown={handlePress}
        onMouseUp={handleRelease}
        onMouseLeave={handleRelease}
        className={`w-32 h-32 cursor-pointer shadow-xl flex items-center justify-center text-4xl ${shape.className}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.9 }}
      >
        {shape.extra}
      </motion.div>
      <motion.p
        className="mt-4 text-slate-600 text-center"
        animate={isPressed ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        Squishing {shape.name}<br />
        Presses: {pressCount} | Release to bounce back
      </motion.p>
    </div>
  );
};

export default StressBall;
