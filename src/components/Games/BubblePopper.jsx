'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const BubblePopper = () => {
  const [bubbles, setBubbles] = useState([]);
  const [particles, setParticles] = useState([]);

   useEffect(() => {
    // Generate random bubbles
    const numBubbles = Math.floor(Math.random() * 10) + 10; // 10-20 bubbles
    const newBubbles = Array.from({ length: numBubbles }, (_, i) => ({
      id: i,
      x: Math.random() * 90 + 5, // 5-95% to keep bubbles in view
      y: Math.random() * 90 + 5, // 5-95% to keep bubbles in view
      size: Math.random() * 50 + 20, // 20-70px
      speed: Math.random() * 2 + 1, // 1-3 seconds
      popped: false,
    }));
    setBubbles(newBubbles);
  }, []);

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
    setBubbles(prev => {
      const updated = prev.map(b => b.id === id ? { ...b, popped: true } : b);
      // If only 3 or fewer bubbles left, add 10 more
      const activeBubbles = updated.filter(b => !b.popped);
      if (activeBubbles.length <= 3) {
        const numNew = 10;
        const newBubbles = Array.from({ length: numNew }, (_, i) => ({
          id: Date.now() + i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 50 + 20,
          speed: Math.random() * 2 + 1,
          popped: false,
        }));
        updated.push(...newBubbles);
      }
      return updated;
    });
    playPopSound();

    // Add particles
    const numParticles = 5;
    const newParticles = Array.from({ length: numParticles }, (_, i) => ({
      id: Date.now() + i,
      x: x + Math.random() * 20 - 10,
      y: y + Math.random() * 20 - 10,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
    }));
    setParticles(prev => [...prev, ...newParticles]);

    // Remove particles after animation
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.some(np => np.id === p.id)));
    }, 1000);
  };

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-sky-200 to-blue-300 rounded-lg overflow-hidden">
      <div className="absolute top-2 left-2 text-white text-sm font-medium bg-black/20 px-2 py-1 rounded">
        Click bubbles to pop them
      </div>
      {bubbles.map(bubble => (
        <motion.div
          key={bubble.id}
          initial={{ x: `${bubble.x}%`, y: `${bubble.y}%`, scale: 0 }}
          animate={
            bubble.popped
              ? { scale: 0, opacity: 0 }
              : {
                  y: [`${bubble.y}%`, `${bubble.y - 10}%`, `${bubble.y}%`],
                  x: [`${bubble.x}%`, `${bubble.x + 5}%`, `${bubble.x}%`],
                  scale: 1,
                  opacity: 1,
                }
          }
          transition={
            bubble.popped
              ? { duration: 0.3 }
              : {
                  y: { duration: bubble.speed, repeat: Infinity, ease: 'easeInOut' },
                  x: { duration: bubble.speed * 1.5, repeat: Infinity, ease: 'easeInOut' },
                }
          }
          className="absolute rounded-full bg-white/70 border border-white/50 cursor-pointer hover:bg-white/90 transition-colors"
          style={{
            width: bubble.size,
            height: bubble.size,
          }}
          onClick={(e) => {
            const rect = e.currentTarget.parentElement.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            popBubble(bubble.id, x, y);
          }}
        />
      ))}
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          initial={{ x: particle.x, y: particle.y, scale: 1, opacity: 1 }}
          animate={{
            x: particle.x + particle.vx * 10,
            y: particle.y + particle.vy * 10,
            scale: 0,
            opacity: 0,
          }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="absolute w-2 h-2 bg-white rounded-full"
        />
      ))}
    </div>
  );
};

export default BubblePopper;
