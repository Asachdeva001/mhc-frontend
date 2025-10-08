'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const CloudPush = () => {
  const [clouds, setClouds] = useState([]);
  const [draggedCloud, setDraggedCloud] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    const numClouds = Math.floor(Math.random() * 5) + 5; // 5-10 clouds
    const newClouds = Array.from({ length: numClouds }, (_, i) => ({
      id: i,
      x: Math.random() * 70 + 10, // 10-80%
      y: Math.random() * 70 + 10,
      size: Math.random() * 40 + 40, // 40-80px
      color: ['bg-white', 'bg-gray-100', 'bg-blue-100'][Math.floor(Math.random() * 3)],
    }));
    setClouds(newClouds);
  }, []);

  useEffect(() => {
    if (clouds.length <= 3) {
      addMoreClouds();
    }
  }, [clouds.length]);

  const playDragSound = () => {
    if (!audioRef.current) {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(100, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.5);

      gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);

      audioRef.current = true;
      setTimeout(() => { audioRef.current = null; }, 600);
    }
  };

  const addMoreClouds = () => {
    const numNew = 10;
    const newClouds = Array.from({ length: numNew }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 70 + 10,
      y: Math.random() * 70 + 10,
      size: Math.random() * 40 + 40,
      color: ['bg-white', 'bg-gray-100', 'bg-blue-100'][Math.floor(Math.random() * 3)],
    }));
    setClouds(prev => [...prev, ...newClouds]);
  };

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-sky-300 via-blue-400 to-indigo-500 rounded-lg overflow-hidden">
      <div className="absolute top-4 left-4 text-white text-sm font-medium bg-black/30 px-2 py-1 rounded">
        Drag the fluffy clouds around
      </div>
      {clouds.map(cloud => (
        <motion.div
          key={cloud.id}
          drag
          dragConstraints={{ left: -50, right: '150%', top: -50, bottom: '150%' }}
          dragElastic={0.1}
          initial={{ x: `${cloud.x}%`, y: `${cloud.y}%`, scale: 0 }}
          animate={draggedCloud === cloud.id ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
          transition={{ delay: cloud.id * 0.1 }}
          onDragStart={() => {
            setDraggedCloud(cloud.id);
            playDragSound();
          }}
          onDragEnd={(event, info) => {
            setDraggedCloud(null);
            // Remove if dragged out of frame
            const container = event.target.parentElement.getBoundingClientRect();
            const cloudRect = event.target.getBoundingClientRect();
            if (cloudRect.right < container.left || cloudRect.left > container.right ||
                cloudRect.bottom < container.top || cloudRect.top > container.bottom) {
              setClouds(prev => prev.filter(c => c.id !== cloud.id));
            }
          }}
          className={`absolute cursor-grab active:cursor-grabbing ${cloud.color} rounded-full opacity-90 shadow-xl`}
          style={{ width: cloud.size, height: cloud.size * 0.7 }}
        >
          <div className="w-full h-full rounded-full bg-gradient-to-b from-white/50 to-transparent" />
        </motion.div>
      ))}
      <motion.div
        className="absolute bottom-4 left-4 text-white text-sm"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        Push the clouds gently 🌤️
      </motion.div>
      <div className="absolute top-4 right-4 text-white/70 text-xs">
        Relaxing sky view
      </div>
    </div>
  );
};

export default CloudPush;
