'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const CloudPush = () => {
  const [clouds, setClouds] = useState([]);
  const [draggedCloud, setDraggedCloud] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    generateClouds(8); // initial 8 clouds
  }, []);

  useEffect(() => {
    if (clouds.length <= 3) {
      generateClouds(10);
    }
  }, [clouds.length]);

  const generateClouds = (count) => {
    const newClouds = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i,
      left: Math.random() * 80 + 5, // spread nicely
      top: Math.random() * 70 + 10,
      size: Math.random() * 40 + 40,
      color: ['bg-white', 'bg-gray-100', 'bg-blue-100'][Math.floor(Math.random() * 3)],
    }));

    setClouds((prev) => [...prev, ...newClouds]);
  };

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

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-sky-300 via-blue-400 to-indigo-500 rounded-lg overflow-hidden">
      <div className="absolute top-4 left-4 text-white text-sm font-medium bg-black/30 px-2 py-1 rounded">
        Drag the fluffy clouds around
      </div>

      {/* CLOUDS */}
      {clouds.map((cloud) => (
        <motion.div
          key={cloud.id}
          drag
          dragConstraints={{ left: -200, right: 800, top: -200, bottom: 800 }}
          dragElastic={0.15}
          initial={{ scale: 0 }}
          animate={
            draggedCloud === cloud.id
              ? { scale: 1.1, rotate: 5 }
              : { scale: 1, rotate: 0 }
          }
          transition={{ duration: 0.4 }}
          onDragStart={() => {
            setDraggedCloud(cloud.id);
            playDragSound();
          }}
          onDragEnd={(event) => {
            setDraggedCloud(null);

            const container = event.target.parentElement.getBoundingClientRect();
            const cloudRect = event.target.getBoundingClientRect();

            if (
              cloudRect.right < container.left ||
              cloudRect.left > container.right ||
              cloudRect.bottom < container.top ||
              cloudRect.top > container.bottom
            ) {
              setClouds((prev) => prev.filter((c) => c.id !== cloud.id));
            }
          }}
          className={`absolute cursor-grab active:cursor-grabbing ${cloud.color} rounded-full opacity-90 shadow-xl`}
          style={{
            width: cloud.size,
            height: cloud.size * 0.7,
            left: `${cloud.left}%`,
            top: `${cloud.top}%`,
          }}
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