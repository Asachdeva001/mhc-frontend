'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const BubblePopper = () => {
  const [bubbles, setBubbles] = useState([]);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    generateBubbles(12); // initial spawn
  }, []);

  const generateBubbles = (count) => {
    const newBubbles = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i,
      left: Math.random() * 85 + 5,  // Spread 5–90%
      top: Math.random() * 85 + 5,
      size: Math.random() * 50 + 20,
      speed: Math.random() * 2 + 1,
      popped: false
    }));

    setBubbles((prev) => [...prev, ...newBubbles]);
  };

  const playPopSound = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  const popBubble = (id, x, y) => {
    setBubbles((prev) => {
      const updated = prev.map((b) => (b.id === id ? { ...b, popped: true } : b));

      if (updated.filter((b) => !b.popped).length <= 3) {
        generateBubbles(10);
      }

      return updated;
    });

    playPopSound();

    const numParticles = 5;
    const newParticles = Array.from({ length: numParticles }, (_, i) => ({
      id: Date.now() + i,
      x: x + Math.random() * 20 - 10,
      y: y + Math.random() * 20 - 10,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4
    }));

    setParticles((prev) => [...prev, ...newParticles]);

    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.some((np) => np.id === p.id)));
    }, 1000);
  };

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-sky-200 to-blue-300 rounded-lg overflow-hidden">
      <div className="absolute top-2 left-2 text-white text-sm font-medium bg-black/20 px-2 py-1 rounded">
        Click bubbles to pop them
      </div>

      {/* BUBBLES */}
      {bubbles.map((bubble) => (
        <motion.div
          key={bubble.id}
          initial={{ scale: 0 }}
          animate={
            bubble.popped
              ? { scale: 0, opacity: 0 }
              : {
                  scale: 1,
                  opacity: 1,
                  y: [0, -10, 0],
                  x: [0, 5, 0]
                }
          }
          transition={
            bubble.popped
              ? { duration: 0.3 }
              : {
                  y: { duration: bubble.speed, repeat: Infinity, ease: 'easeInOut' },
                  x: { duration: bubble.speed * 1.5, repeat: Infinity, ease: 'easeInOut' }
                }
          }
          className="absolute rounded-full bg-white/70 border border-white/50 cursor-pointer hover:bg-white/90 transition-colors"
          style={{
            width: bubble.size,
            height: bubble.size,
            left: `${bubble.left}%`,
            top: `${bubble.top}%`
          }}
          onClick={(e) => {
            const rect = e.currentTarget.parentElement.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            popBubble(bubble.id, x, y);
          }}
        />
      ))}

      {/* PARTICLES */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{ x: particle.x, y: particle.y, scale: 1, opacity: 1 }}
          animate={{
            x: particle.x + particle.vx * 10,
            y: particle.y + particle.vy * 10,
            scale: 0,
            opacity: 0
          }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="absolute w-2 h-2 bg-white rounded-full"
        />
      ))}
    </div>
  );
};

export default BubblePopper;