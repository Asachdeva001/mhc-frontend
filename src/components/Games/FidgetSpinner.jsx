'use client';

import { motion } from 'framer-motion';
import { useState, useRef } from 'react';

const designs = [
  { name: 'Classic', color: 'bg-gray-400' },
  { name: 'Rainbow', background: 'bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 via-blue-400 to-purple-400' },
  { name: 'Neon', color: 'bg-green-400 shadow-green-400 shadow-lg' },
  { name: 'Ocean', background: 'bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400' },
  { name: 'Sunset', background: 'bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400' },
];

const FidgetSpinner = () => {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const audioRef = useRef(null);
  const design = designs[Math.floor(Math.random() * designs.length)];

  const playSpinSound = () => {
    if (!audioRef.current) {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 1);

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 1);

      audioRef.current = true;
      setTimeout(() => { audioRef.current = null; }, 1000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-b from-indigo-100 to-purple-100 rounded-lg">
      <div className="text-slate-700 text-sm font-medium bg-white/70 px-2 py-1 rounded mb-4">
        Drag to spin and relax
      </div>
      <motion.div
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.1}
        onDragStart={() => setIsSpinning(true)}
        onDragEnd={(event, info) => {
          const velocity = Math.abs(info.velocity.x) + Math.abs(info.velocity.y);
          if (velocity > 100) {
            setRotation(prev => prev + velocity * 5);
            playSpinSound();
          }
          setIsSpinning(false);
        }}
        animate={{ rotate: rotation }}
        transition={{ type: 'spring', damping: 0.5, stiffness: 100 }}
        className={`w-32 h-32 rounded-full ${design.background || design.color} cursor-grab active:cursor-grabbing shadow-xl`}
      >
        <div className="w-full h-full relative">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="absolute w-4 h-16 bg-white/70 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 shadow-md"
              style={{ transform: `translate(-50%, -50%) rotate(${i * 120}deg)` }}
              animate={isSpinning ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.3, repeat: isSpinning ? Infinity : 0 }}
            />
          ))}
        </div>
      </motion.div>
      <motion.p
        className="mt-4 text-slate-600 text-center"
        animate={isSpinning ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.5 }}
      >
        Spinning {design.name} spinner<br />
        Feel the calming motion
      </motion.p>
    </div>
  );
};

export default FidgetSpinner;
