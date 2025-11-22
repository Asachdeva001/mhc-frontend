'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MEDITATION_AFFIRMATIONS = [
  "You can do it!",
  "Focus on yourself",
  "Close your eyes",
  "Breathe deeply",
  "Find your peace",
  "Let go of stress",
  "You are calm",
  "Embrace the moment",
  "Mind over matter",
  "Be present now",
];

/**
 * Meditation - Visualization component with affirmations
 * Displays animated affirmations during meditation
 * 
 * Props from wrapper:
 * - activity: Activity object
 * - timeRemaining: Current time in seconds
 * - totalTime: Total duration in seconds
 * - isPaused: Whether activity is paused
 * - formatTime: Time formatter function
 */
export default function Meditation({
  activity,
  timeRemaining,
  totalTime,
  isPaused,
  formatTime,
}) {
  const [affirmationIndex, setAffirmationIndex] = useState(0);

  // Cycle through affirmations every 3 seconds
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setAffirmationIndex(prev => (prev + 1) % MEDITATION_AFFIRMATIONS.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-6 py-6 px-4">
      {/* Description */}
      <div className="text-center">
        <p className="text-lg text-sanctuary-slate/70 font-quicksand max-w-md">
          {activity.description}
        </p>
      </div>

      {/* Affirmation Display */}
      <div className="relative w-full max-w-md">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -inset-4 bg-gradient-to-r from-purple-400/20 via-pink-400/20 to-indigo-400/20 rounded-3xl blur-xl"
        />
        <div className="relative min-h-[140px] rounded-3xl bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-xl border-2 border-white/60 shadow-2xl flex items-center justify-center p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={affirmationIndex}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent text-center font-nunito"
            >
              ✨ {MEDITATION_AFFIRMATIONS[affirmationIndex]} ✨
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Breathing circle animation */}
      <div className="relative flex items-center justify-center my-4">
        <motion.div
          animate={!isPaused ? { scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] } : { opacity: 0.4 }}
          transition={!isPaused ? { duration: 6, repeat: Infinity, ease: 'easeInOut' } : {}}
          className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-400/30 to-indigo-400/30 blur-xl absolute"
        />
        <motion.div
          animate={!isPaused ? { scale: [1, 1.15, 1] } : {}}
          transition={!isPaused ? { duration: 6, repeat: Infinity, ease: 'easeInOut' } : {}}
          className="relative w-24 h-24 rounded-full bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-xl border-2 border-white/60 shadow-xl flex items-center justify-center"
        >
          <span className="text-3xl">🧘</span>
        </motion.div>
      </div>

      {/* Affirmation counter */}
      <div className="flex gap-1.5 flex-wrap justify-center max-w-xs">
        {MEDITATION_AFFIRMATIONS.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === affirmationIndex 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 scale-150 shadow-lg' 
                : 'bg-sanctuary-slate/20'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
