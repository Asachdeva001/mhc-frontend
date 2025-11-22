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
    <div className="w-full flex flex-col items-center">
      <div className="mb-6 text-slate-700 text-center max-w-md px-4">
        {activity.description}
      </div>

      {/* Affirmation Display */}
      <div className="w-72 h-32 rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center shadow-inner mb-6 min-h-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={affirmationIndex}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-semibold text-indigo-700 text-center px-4"
          >
            {MEDITATION_AFFIRMATIONS[affirmationIndex]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Timer Display */}
      <div className="w-72 h-48 rounded-xl bg-gradient-to-b from-indigo-50 to-violet-100 flex items-center justify-center shadow-inner">
        <motion.div
          animate={!isPaused ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 8, repeat: !isPaused ? Infinity : 0 }}
          className="p-6"
        >
          <div className="text-5xl font-bold text-slate-800 tabular-nums">
            {formatTime(timeRemaining)}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
